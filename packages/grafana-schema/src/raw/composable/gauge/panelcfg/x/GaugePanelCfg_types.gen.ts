// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     public/app/plugins/gen.go
// Using jennies:
//     TSTypesJenny
//     LatestMajorsOrXJenny
//     PluginEachMajorJenny
//
// Run 'make gen-cue' from repository root to regenerate.

import * as common from '@grafana/schema';

export const pluginVersion = "10.2.3";

export interface Options extends common.SingleStatBaseOptions {
  minVizHeight: number;
  minVizWidth: number;
  showThresholdLabels: boolean;
  showThresholdMarkers: boolean;
}

export const defaultOptions: Partial<Options> = {
  minVizHeight: 75,
  minVizWidth: 75,
  showThresholdLabels: false,
  showThresholdMarkers: true,
};
