import { css, cx } from '@emotion/css';
import React from 'react';
import { DragDropContext, Draggable, DraggableProvided, Droppable, DropResult } from 'react-beautiful-dnd';

import { GrafanaTheme2 } from '@grafana/data/src';
import { useTheme2 } from '@grafana/ui/src';

import { LogsTableNavField } from './LogsTableNavField';
import { fieldNameMeta } from './LogsTableWrap';

function getStyles(theme: GrafanaTheme2) {
  return {
    wrap: css({
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      display: 'flex',
    }),
    // Making the checkbox sticky and label scrollable for labels that are wider then the container
    // However, the checkbox component does not support this, so we need to do some css hackery for now until the API of that component is updated.
    columnWrapper: css({
      marginBottom: theme.spacing(1.5),
      // need some space or the outline of the checkbox is cut off
      paddingLeft: theme.spacing(0.5),
    }),
    empty: css({
      marginBottom: theme.spacing(2),
      marginLeft: theme.spacing(1.75),
      fontSize: theme.typography.fontSize,
    }),
  };
}

const collator = new Intl.Collator(undefined, { sensitivity: 'base' });

function sortLabels(labels: Record<string, fieldNameMeta>) {
  return (a: string, b: string) => {
    const la = labels[a];
    const lb = labels[b];

    // If there is a user defined index, use that order
    if (la.index != null && lb.index != null) {
      return la.index - lb.index;
    }

    // ...sort by type and alphabetically
    if (la != null && lb != null) {
      return (
        Number(lb.type === 'TIME_FIELD') - Number(la.type === 'TIME_FIELD') ||
        Number(lb.type === 'BODY_FIELD') - Number(la.type === 'BODY_FIELD') ||
        collator.compare(a, b)
      );
    }

    // otherwise do not sort
    return 0;
  };
}

export const LogsTableNavColumn = (props: {
  labels: Record<string, fieldNameMeta>;
  valueFilter: (value: string) => boolean;
  toggleColumn: (columnName: string) => void;
  id: string;
  reorderColumn?: (sourceIndex: number, destinationIndex: number) => void;
}): JSX.Element => {
  const { reorderColumn } = props;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !reorderColumn) {
      return;
    }
    reorderColumn(result.source.index, result.destination.index);
  };

  const { labels, valueFilter, toggleColumn, id } = props;
  const theme = useTheme2();
  const styles = getStyles(theme);
  const labelKeys = Object.keys(labels).filter((labelName) => valueFilter(labelName));
  if (labelKeys.length) {
    // If we have a reorderColumn function, we need to wrap the nav items in dnd components
    if (reorderColumn) {
      return (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={id} direction="vertical">
            {(provided) => (
              <div className={styles.columnWrapper} {...provided.droppableProps} ref={provided.innerRef}>
                {labelKeys.sort(sortLabels(labels)).map((labelName, index) => (
                  <Draggable draggableId={labelName} key={labelName} index={index}>
                    {(provided: DraggableProvided) => (
                      <div
                        className={styles.wrap}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        title={`${labelName} appears in ${labels[labelName]?.percentOfLinesWithLabel}% of log lines`}
                      >
                        <LogsTableNavField
                          label={labelName}
                          onChange={() => toggleColumn(labelName)}
                          labels={labels}
                          draggable={true}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }

    // Otherwise show list with a hardcoded order
    return (
      <div className={styles.columnWrapper}>
        {labelKeys.sort(sortLabels(labels)).map((labelName, index) => (
          <div
            key={labelName}
            className={styles.wrap}
            title={`${labelName} appears in ${labels[labelName]?.percentOfLinesWithLabel}% of log lines`}
          >
            <LogsTableNavField label={labelName} onChange={() => toggleColumn(labelName)} labels={labels} />
          </div>
        ))}
      </div>
    );
  }

  return <div className={styles.empty}>No fields</div>;
};
