import { cx, css } from '@emotion/css';
import React, { ChangeEvent } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { Unsubscribable } from 'rxjs';

import {
  DataFrame,
  DataTransformerConfig,
  DocsId,
  GrafanaTheme2,
  PanelData,
  SelectableValue,
  standardTransformersRegistry,
  TransformerRegistryItem,
  TransformerCategory,
  DataTransformerID,
  TransformationApplicabilityLevels,
} from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';
import { reportInteraction } from '@grafana/runtime';
import {
  Alert,
  Button,
  ConfirmModal,
  Container,
  CustomScrollbar,
  FilterPill,
  Themeable,
  VerticalGroup,
  withTheme,
  Input,
  Icon,
  IconButton,
  useStyles2,
  Card,
  Switch,
} from '@grafana/ui';
import { LocalStorageValueProvider } from 'app/core/components/LocalStorageValueProvider';
import config from 'app/core/config';
import { getDocsLink } from 'app/core/utils/docsLinks';
import { PluginStateInfo } from 'app/features/plugins/components/PluginStateInfo';
import { categoriesLabels } from 'app/features/transformers/utils';

import { AppNotificationSeverity } from '../../../../types';
import { PanelModel } from '../../state';
import { PanelNotSupported } from '../PanelEditor/PanelNotSupported';

import { TransformationOperationRows } from './TransformationOperationRows';
import { TransformationsEditorTransformation } from './types';

const LOCAL_STORAGE_KEY = 'dashboard.components.TransformationEditor.featureInfoBox.isDismissed';

interface TransformationsEditorProps extends Themeable {
  panel: PanelModel;
}

type viewAllType = 'viewAll';
const viewAllValue = 'viewAll';
const viewAllLabel = 'View all';

type FilterCategory = TransformerCategory | viewAllType;

const filterCategoriesLabels: Array<[FilterCategory, string]> = [
  [viewAllValue, viewAllLabel],
  ...(Object.entries(categoriesLabels) as Array<[FilterCategory, string]>),
];

export interface TransformationData {
  series: DataFrame[];
  annotations?: DataFrame[];
};

interface State {
  data: TransformationData;
  transformations: TransformationsEditorTransformation[];
  search: string;
  showPicker?: boolean;
  scrollTop?: number;
  showRemoveAllModal?: boolean;
  selectedFilter?: FilterCategory;
  showIllustrations?: boolean;
}

class UnThemedTransformationsEditor extends React.PureComponent<TransformationsEditorProps, State> {
  subscription?: Unsubscribable;

  constructor(props: TransformationsEditorProps) {
    super(props);
    const transformations = props.panel.transformations || [];

    const ids = this.buildTransformationIds(transformations);
    this.state = {
      transformations: transformations.map((t, i) => ({
        transformation: t,
        id: ids[i],
      })),
      data: {
        series: [],
      },
      search: '',
      selectedFilter: viewAllValue,
      showIllustrations: true,
    };
  }

  onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({ search: event.target.value });
  };

  onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const { search } = this.state;
      if (search) {
        const lower = search.toLowerCase();
        const filtered = standardTransformersRegistry.list().filter((t) => {
          const txt = (t.name + t.description).toLowerCase();
          return txt.indexOf(lower) >= 0;
        });
        if (filtered.length > 0) {
          this.onTransformationAdd({ value: filtered[0].id });
        }
      }
    } else if (event.keyCode === 27) {
      // Escape key
      this.setState({ search: '', showPicker: false });
      event.stopPropagation(); // don't exit the editor
    }
  };

  buildTransformationIds(transformations: DataTransformerConfig[]) {
    const transformationCounters: Record<string, number> = {};
    const transformationIds: string[] = [];

    for (let i = 0; i < transformations.length; i++) {
      const transformation = transformations[i];
      if (transformationCounters[transformation.id] === undefined) {
        transformationCounters[transformation.id] = 0;
      } else {
        transformationCounters[transformation.id] += 1;
      }
      transformationIds.push(`${transformations[i].id}-${transformationCounters[transformations[i].id]}`);
    }
    return transformationIds;
  }

  componentDidMount() {
    this.subscription = this.props.panel
      .getQueryRunner()
      .getData({ withTransforms: false, withFieldConfig: false })
      .subscribe({
        next: (panelData: PanelData) => this.setState({ data: panelData }),
      });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  componentDidUpdate(prevProps: Readonly<TransformationsEditorProps>, prevState: Readonly<State>): void {
    if (config.featureToggles.transformationsRedesign) {
      const prevHasTransforms = prevState.transformations.length > 0;
      const prevShowPicker = !prevHasTransforms || prevState.showPicker;

      const currentHasTransforms = this.state.transformations.length > 0;
      const currentShowPicker = !currentHasTransforms || this.state.showPicker;

      if (prevShowPicker !== currentShowPicker) {
        // kindOfZero will be a random number between 0 and 0.5. It will be rounded to 0 by the scrollable component.
        // We cannot always use 0 as it will not trigger a rerender of the scrollable component consistently
        // due to React changes detection algo.
        const kindOfZero = Math.random() / 2;

        this.setState({ scrollTop: currentShowPicker ? kindOfZero : Number.MAX_SAFE_INTEGER });
      }
    }
  }

  onChange(transformations: TransformationsEditorTransformation[]) {
    this.setState({ transformations });
    this.props.panel.setTransformations(transformations.map((t) => t.transformation));
  }

  // Transformation UIDs are stored in a name-X form. name is NOT unique hence we need to parse the IDs and increase X
  // for transformations with the same name
  getTransformationNextId = (name: string) => {
    const { transformations } = this.state;
    let nextId = 0;
    const existingIds = transformations.filter((t) => t.id.startsWith(name)).map((t) => t.id);

    if (existingIds.length !== 0) {
      nextId = Math.max(...existingIds.map((i) => parseInt(i.match(/\d+/)![0], 10))) + 1;
    }

    return `${name}-${nextId}`;
  };

  onTransformationAdd = (selectable: SelectableValue<string>) => {
    let eventName = 'panel_editor_tabs_transformations_management';
    if (config.featureToggles.transformationsRedesign) {
      eventName = 'transformations_redesign_' + eventName;
    }

    reportInteraction(eventName, {
      action: 'add',
      transformationId: selectable.value,
    });
    const { transformations } = this.state;

    const nextId = this.getTransformationNextId(selectable.value!);
    this.setState({ search: '', showPicker: false });
    this.onChange([
      ...transformations,
      {
        id: nextId,
        transformation: {
          id: selectable.value as string,
          options: {},
        },
      },
    ]);
  };

  onTransformationChange = (idx: number, dataConfig: DataTransformerConfig) => {
    const { transformations } = this.state;
    const next = Array.from(transformations);
    let eventName = 'panel_editor_tabs_transformations_management';
    if (config.featureToggles.transformationsRedesign) {
      eventName = 'transformations_redesign_' + eventName;
    }

    reportInteraction(eventName, {
      action: 'change',
      transformationId: next[idx].transformation.id,
    });
    next[idx].transformation = dataConfig;
    this.onChange(next);
  };

  onTransformationRemove = (idx: number) => {
    const { transformations } = this.state;
    const next = Array.from(transformations);
    let eventName = 'panel_editor_tabs_transformations_management';
    if (config.featureToggles.transformationsRedesign) {
      eventName = 'transformations_redesign_' + eventName;
    }

    reportInteraction(eventName, {
      action: 'remove',
      transformationId: next[idx].transformation.id,
    });
    next.splice(idx, 1);
    this.onChange(next);
  };

  onTransformationRemoveAll = () => {
    this.onChange([]);
    this.setState({ showRemoveAllModal: false });
  };

  onDragEnd = (result: DropResult) => {
    const { transformations } = this.state;

    if (!result || !result.destination) {
      return;
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    if (startIndex === endIndex) {
      return;
    }
    const update = Array.from(transformations);
    const [removed] = update.splice(startIndex, 1);
    update.splice(endIndex, 0, removed);
    this.onChange(update);
  };

  renderTransformationEditors = () => {
    const styles = getStyles(config.theme2);
    const { data, transformations, showPicker } = this.state;
    const hide = config.featureToggles.transformationsRedesign && showPicker;

    return (
      <div className={cx({ [styles.hide]: hide })}>
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="transformations-list" direction="vertical">
            {(provided) => {
              return (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <TransformationOperationRows
                    configs={transformations}
                    data={data}
                    onRemove={this.onTransformationRemove}
                    onChange={this.onTransformationChange}
                  />
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        </DragDropContext>
      </div>
    );
  };

  renderTransformsPicker() {
    const styles = getStyles(config.theme2);
    const { transformations, search } = this.state;
    let suffix: React.ReactNode = null;
    let xforms = standardTransformersRegistry.list().sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

    if (this.state.selectedFilter !== viewAllValue) {
      xforms = xforms.filter(
        (t) =>
          t.categories &&
          this.state.selectedFilter &&
          t.categories.has(this.state.selectedFilter as TransformerCategory)
      );
    }

    if (search) {
      const lower = search.toLowerCase();
      const filtered = xforms.filter((t) => {
        const txt = (t.name + t.description).toLowerCase();
        return txt.indexOf(lower) >= 0;
      });

      suffix = (
        <>
          {filtered.length} / {xforms.length} &nbsp;&nbsp;
          <IconButton
            name="times"
            onClick={() => {
              this.setState({ search: '' });
            }}
            tooltip="Clear search"
          />
        </>
      );

      xforms = filtered;
    }

    const noTransforms = !transformations?.length;
    const showPicker = noTransforms || this.state.showPicker;

    if (!suffix && showPicker && !noTransforms) {
      suffix = (
        <IconButton
          name="times"
          onClick={() => {
            this.setState({ showPicker: false });
          }}
          tooltip="Close picker"
        />
      );
    }

    return (
      <>
        {noTransforms && !config.featureToggles.transformationsRedesign && (
          <Container grow={1}>
            <LocalStorageValueProvider<boolean> storageKey={LOCAL_STORAGE_KEY} defaultValue={false}>
              {(isDismissed, onDismiss) => {
                if (isDismissed) {
                  return null;
                }

                return (
                  <Alert
                    title="Transformations"
                    severity="info"
                    onRemove={() => {
                      onDismiss(true);
                    }}
                  >
                    <p>
                      Transformations allow you to join, calculate, re-order, hide, and rename your query results before
                      they are visualized. <br />
                      Many transforms are not suitable if you&apos;re using the Graph visualization, as it currently
                      only supports time series data. <br />
                      It can help to switch to the Table visualization to understand what a transformation is doing.{' '}
                    </p>
                    <a
                      href={getDocsLink(DocsId.Transformations)}
                      className="external-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Read more
                    </a>
                  </Alert>
                );
              }}
            </LocalStorageValueProvider>
          </Container>
        )}
        {showPicker ? (
          <>
            {config.featureToggles.transformationsRedesign && (
              <>
                {!noTransforms && (
                  <Button
                    variant="secondary"
                    fill="text"
                    icon="angle-left"
                    onClick={() => {
                      this.setState({ showPicker: false });
                    }}
                  >
                    Go back to&nbsp;<i>Transformations in use</i>
                  </Button>
                )}
                <div className={styles.pickerInformationLine}>
                  <a
                    href={getDocsLink(DocsId.Transformations)}
                    className="external-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className={styles.pickerInformationLineHighlight}>Transformations</span>{' '}
                    <Icon name="external-link-alt" />
                  </a>
                  &nbsp;allow you to manipulate your data before a visualization is applied.
                </div>
              </>
            )}
            <VerticalGroup>
              {!config.featureToggles.transformationsRedesign && (
                <Input
                  data-testid={selectors.components.Transforms.searchInput}
                  value={search ?? ''}
                  autoFocus={!noTransforms}
                  placeholder="Search for transformation"
                  onChange={this.onSearchChange}
                  onKeyDown={this.onSearchKeyDown}
                  suffix={suffix}
                />
              )}

              {!config.featureToggles.transformationsRedesign &&
                xforms.map((t) => {
                  return (
                    <TransformationCard
                      key={t.name}
                      transform={t}
                      onClick={() => {
                        this.onTransformationAdd({ value: t.id });
                      }}
                    />
                  );
                })}

              {config.featureToggles.transformationsRedesign && (
                <div className={styles.searchWrapper}>
                  <Input
                    data-testid={selectors.components.Transforms.searchInput}
                    className={styles.searchInput}
                    value={search ?? ''}
                    autoFocus={!noTransforms}
                    placeholder="Search for transformation"
                    onChange={this.onSearchChange}
                    onKeyDown={this.onSearchKeyDown}
                    suffix={suffix}
                  />
                  <div className={styles.showImages}>
                    <span className={styles.illustationSwitchLabel}>Show images</span>{' '}
                    <Switch
                      value={this.state.showIllustrations}
                      onChange={() => this.setState({ showIllustrations: !this.state.showIllustrations })}
                    />
                  </div>
                </div>
              )}

              {config.featureToggles.transformationsRedesign && (
                <div className={styles.filterWrapper}>
                  {filterCategoriesLabels.map(([slug, label]) => {
                    return (
                      <FilterPill
                        key={slug}
                        onClick={() => this.setState({ selectedFilter: slug })}
                        label={label}
                        selected={this.state.selectedFilter === slug}
                      />
                    );
                  })}
                </div>
              )}

              {config.featureToggles.transformationsRedesign && (
                <TransformationsGrid
                  showIllustrations={this.state.showIllustrations}
                  transformations={xforms}
                  data={this.state.data.series}
                  onClick={(id) => {
                    this.onTransformationAdd({ value: id });
                  }}
                />
              )}
            </VerticalGroup>
          </>
        ) : (
          <Button
            icon="plus"
            variant="secondary"
            onClick={() => {
              this.setState({ showPicker: true });
            }}
            data-testid={selectors.components.Transforms.addTransformationButton}
          >
            Add{config.featureToggles.transformationsRedesign ? ' another ' : ' '}transformation
          </Button>
        )}
      </>
    );
  }

  render() {
    const styles = getStyles(config.theme2);
    const {
      panel: { alert },
    } = this.props;
    const { transformations } = this.state;

    const hasTransforms = transformations.length > 0;

    if (!hasTransforms && alert) {
      return <PanelNotSupported message="Transformations can't be used on a panel with existing alerts" />;
    }

    return (
      <CustomScrollbar scrollTop={this.state.scrollTop} autoHeightMin="100%">
        <Container padding="lg">
          <div data-testid={selectors.components.TransformTab.content}>
            {hasTransforms && alert ? (
              <Alert
                severity={AppNotificationSeverity.Error}
                title="Transformations can't be used on a panel with alerts"
              />
            ) : null}
            {hasTransforms && config.featureToggles.transformationsRedesign && !this.state.showPicker && (
              <div className={styles.listInformationLineWrapper}>
                <span className={styles.listInformationLineText}>Transformations in use</span>{' '}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    this.setState({ showRemoveAllModal: true });
                  }}
                >
                  Delete all transformations
                </Button>
                <ConfirmModal
                  isOpen={Boolean(this.state.showRemoveAllModal)}
                  title="Delete all transformations?"
                  body="By deleting all transformations, you will go back to the main selection screen."
                  confirmText="Delete all"
                  onConfirm={() => this.onTransformationRemoveAll()}
                  onDismiss={() => this.setState({ showRemoveAllModal: false })}
                />
              </div>
            )}
            {hasTransforms && this.renderTransformationEditors()}
            {this.renderTransformsPicker()}
          </div>
        </Container>
      </CustomScrollbar>
    );
  }
}

interface TransformationCardProps {
  transform: TransformerRegistryItem<any>;
  onClick: () => void;
}

function TransformationCard({ transform, onClick }: TransformationCardProps) {
  const styles = useStyles2(getStyles);
  return (
    <Card
      className={styles.card}
      data-testid={selectors.components.TransformTab.newTransform(transform.name)}
      onClick={onClick}
    >
      <Card.Heading>{transform.name}</Card.Heading>
      <Card.Description>{transform.description}</Card.Description>
      {transform.state && (
        <Card.Tags>
          <PluginStateInfo state={transform.state} />
        </Card.Tags>
      )}
    </Card>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    hide: css({
      display: 'none',
    }),
    card: css({
      margin: '0',
      padding: `${theme.spacing(1)}`,
    }),
    grid: css({
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gridAutoRows: '1fr',
      gap: `${theme.spacing(2)} ${theme.spacing(1)}`,
      width: '100%',
    }),
    newCard: css({
      gridTemplateRows: 'min-content 0 1fr 0',
    }),
    cardDisabled: css({
      backgroundColor: 'rgb(204, 204, 220, 0.045)',
      color: `${theme.colors.text.disabled} !important`,
    }),
    heading: css`
      font-weight: 400,
      > button: {
        width: '100%',
        display: 'flex',
        justify-content: 'space-between',
        align-items: 'center',
        flex-wrap: 'no-wrap',
      },
    `,
    description: css({
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }),
    image: css({
      display: 'block',
      maxEidth: '100%`',
      marginTop: `${theme.spacing(2)}`,
    }),
    searchWrapper: css({
      display: 'flex',
      flexWrap: 'wrap',
      columnGap: '27px',
      rowGap: '16px',
      width: '100%',
    }),
    searchInput: css({
      flexGrow: '1',
      width: 'initial',
    }),
    showImages: css({
      flexBasis: '0',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    }),
    pickerInformationLine: css({
      fontSize: '16px',
      marginBottom: `${theme.spacing(2)}`,
    }),
    pickerInformationLineHighlight: css({
      verticalAlign: 'middle',
    }),
    illustationSwitchLabel: css({
      whiteSpace: 'nowrap',
    }),
    filterWrapper: css({
      padding: `${theme.spacing(1)} 0`,
      display: 'flex',
      flexWrap: 'wrap',
      rowGap: `${theme.spacing(1)}`,
      columnGap: `${theme.spacing(0.5)}`,
    }),
    listInformationLineWrapper: css({
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '24px',
    }),
    listInformationLineText: css({
      fontSize: '16px',
    }),
    pluginStateInfoWrapper: css({
      marginLeft: '5px',
    }),
    cardApplicableInfo: css({
      position: 'absolute',
      bottom: `${theme.spacing(1)}`,
      right: `${theme.spacing(1)}`,
    }),
  };
};

interface TransformationsGridProps {
  transformations: Array<TransformerRegistryItem<any>>;
  showIllustrations?: boolean;
  onClick: (id: string) => void;
  data: DataFrame[];
}

function TransformationsGrid({ showIllustrations, transformations, onClick, data }: TransformationsGridProps) {
  const styles = useStyles2(getStyles);

  return (
    <div className={styles.grid}>
      {transformations.map((transform) => {
        // Check to see if the transform
        // is applicable to the given data
        let applicabilityScore = TransformationApplicabilityLevels.Applicable;
        if (transform.transformation.isApplicable !== undefined) {
          applicabilityScore = transform.transformation.isApplicable(data);
        }
        const isApplicable = applicabilityScore > 0;

        let applicabilityDescription = null;
        if (transform.transformation.isApplicableDescription !== undefined) {
          if (typeof transform.transformation.isApplicableDescription === 'function') {
            applicabilityDescription = transform.transformation.isApplicableDescription(data);
          } else {
            applicabilityDescription = transform.transformation.isApplicableDescription;
          }
        }

        // Add disabled styles to disabled
        let cardClasses = styles.newCard;
        if (!isApplicable) {
          cardClasses = cx(styles.newCard, styles.cardDisabled);
        }

        return (
          <Card
            className={cardClasses}
            data-testid={selectors.components.TransformTab.newTransform(transform.name)}
            onClick={() => onClick(transform.id)}
            key={transform.id}
          >
            <Card.Heading className={styles.heading}>
              <>
                <span>{transform.name}</span>
                <span className={styles.pluginStateInfoWrapper}>
                  <PluginStateInfo state={transform.state} />
                </span>
              </>
            </Card.Heading>
            <Card.Description className={styles.description}>
              <>
                <span>{getTransformationsRedesignDescriptions(transform.id)}</span>
                {showIllustrations && (
                  <span>
                    <img
                      className={styles.image}
                      src={getImagePath(transform.id, !isApplicable)}
                      alt={transform.name}
                    />
                  </span>
                )}
                {!isApplicable && applicabilityDescription !== null && (
                  <IconButton
                    className={styles.cardApplicableInfo}
                    name="info-circle"
                    tooltip={applicabilityDescription}
                  />
                )}
              </>
            </Card.Description>
          </Card>
        );
      })}
    </div>
  );
}

const getImagePath = (id: string, disabled: boolean) => {
  let folder = null;
  if (!disabled) {
    folder = config.theme2.isDark ? 'dark' : 'light';
  } else {
    folder = 'disabled';
  }

  return `public/img/transformations/${folder}/${id}.svg`;
};

const getTransformationsRedesignDescriptions = (id: string): string => {
  const overrides: { [key: string]: string } = {
    [DataTransformerID.concatenate]: 'Combine all fields into a single frame.',
    [DataTransformerID.configFromData]: 'Set unit, min, max and more.',
    [DataTransformerID.fieldLookup]: 'Use a field value to lookup countries, states, or airports.',
    [DataTransformerID.filterFieldsByName]: 'Remove parts of the query results using a regex pattern.',
    [DataTransformerID.filterByRefId]: 'Remove rows from the data based on origin query',
    [DataTransformerID.filterByValue]: 'Remove rows from the query results using user-defined filters.',
    [DataTransformerID.groupBy]: 'Group data by a field value and create aggregate data.',
    [DataTransformerID.groupingToMatrix]: 'Summarize and reorganize data based on three fields.',
    [DataTransformerID.joinByField]: 'Combine rows from 2+ tables, based on a related field.',
    [DataTransformerID.labelsToFields]: 'Group series by time and return labels or tags as fields.',
    [DataTransformerID.merge]: 'Merge multiple series. Values will be combined into one row.',
    [DataTransformerID.organize]: 'Re-order, hide, or rename fields.',
    [DataTransformerID.partitionByValues]: 'Split a one-frame dataset into multiple series.',
    [DataTransformerID.prepareTimeSeries]: 'Stretch data frames from the wide format into the long format.',
    [DataTransformerID.reduce]: 'Reduce all rows or data points to a single value (ex. max, mean).',
    [DataTransformerID.renameByRegex]:
      'Rename parts of the query results using a regular expression and replacement pattern.',
    [DataTransformerID.seriesToRows]: 'Merge multiple series. Return time, metric and values as a row.',
  };

  return overrides[id] || standardTransformersRegistry.getIfExists(id)?.description || '';
};

export const TransformationsEditor = withTheme(UnThemedTransformationsEditor);
