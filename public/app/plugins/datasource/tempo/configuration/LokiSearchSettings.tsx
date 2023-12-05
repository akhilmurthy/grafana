import React from 'react';

import {
  DataSourceInstanceSettings,
  DataSourcePluginOptionsEditorProps,
  updateDatasourcePluginJsonDataOption,
} from '@grafana/data';
import { config, getDataSourceSrv, setDataSourceSrv } from '@grafana/runtime';
import { DataSourcePicker } from '@grafana/runtime/src/components/DataSourcePicker';
import { Button, InlineField, InlineFieldRow, useStyles2 } from '@grafana/ui';

import { TempoJsonData } from '../types';

import { getStyles } from './QuerySettings';

import { DatasourceSrv } from '/Users/fabriziocasatigrafana/Documents/github_repos/grafana/public/app/features/plugins/datasource_srv';

interface Props extends DataSourcePluginOptionsEditorProps<TempoJsonData> {}

export function LokiSearchSettings({ options, onOptionsChange }: Props) {
  const styles = useStyles2(getStyles);

  // Default to the trace to logs datasource if configured and loki search was enabled
  // but only if jsonData.lokiSearch hasn't been set
  const legacyDatasource =
    options.jsonData.tracesToLogs?.lokiSearch !== false ? options.jsonData.tracesToLogs?.datasourceUid : undefined;
  if (legacyDatasource && options.jsonData.lokiSearch === undefined) {
    updateDatasourcePluginJsonDataOption({ onOptionsChange, options }, 'lokiSearch', {
      datasourceUid: legacyDatasource,
    });
  }

  const dataSourceSrv = new DatasourceSrv();
  dataSourceSrv.init(config.datasources, config.defaultDatasource);
  setDataSourceSrv(dataSourceSrv);
  console.log('LokiSearchSettings', getDataSourceSrv());

  return (
    <div className={styles.container}>
      <InlineFieldRow className={styles.row}>
        <InlineField tooltip="The Loki data source with the service graph data" label="Data source" labelWidth={26}>
          <DataSourcePicker
            inputId="loki-search-data-source-picker"
            pluginId="loki"
            current={options.jsonData.lokiSearch?.datasourceUid}
            noDefault={true}
            width={40}
            onChange={(ds: DataSourceInstanceSettings) =>
              updateDatasourcePluginJsonDataOption({ onOptionsChange, options }, 'lokiSearch', {
                datasourceUid: ds.uid,
              })
            }
          />
        </InlineField>
        {options.jsonData.lokiSearch?.datasourceUid ? (
          <Button
            type={'button'}
            variant={'secondary'}
            size={'sm'}
            fill={'text'}
            onClick={() => {
              updateDatasourcePluginJsonDataOption({ onOptionsChange, options }, 'lokiSearch', {
                datasourceUid: undefined,
              });
            }}
          >
            Clear
          </Button>
        ) : null}
      </InlineFieldRow>
    </div>
  );
}
