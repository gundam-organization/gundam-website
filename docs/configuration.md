# Configuration File Reference

## Configuring GUNDAM

GUNDAM is configured using YAML (Json) input files that describe and control every aspect of the job.  For the most part, the input files are directly handled as standard YAML, with one minor exception to include files into the configuration.

### Best practices: Including other files into the configuration.

The recommended practice is to break the configuration into several input
files that reflect the logical structure and to include them using the
include file mechanism.

The GUNDAM libraries start by reading the entire configuration in to
memory, and then it is interpreted into a json structure according to the
[usual rules](https://www.yaml.org) with one exception.  If the value of a
string is found to end in the extension ".yaml", then the string is treated
as a filename relative to the current working directory to be included at
that point, and the contents of the file is substituted into the input
stream.  For instance

```yaml
fitterEngineConfig: "./inputs/engineConfiguration.yaml"
```

will read the contents of the "./inputs/engineConfiguration.yaml" file as a `Json` object add it to the full `Json` object as a child of the "fitterEngineConfig" field.  This provides convenient ways to factor the full configuration into components.

```yaml
minGundamVersion: 2.0.0
fitterEngineConfig:
    minimizerConfig:
        type: RootMinimizer
        minimizer: Minuit2
    likelihoodInterfaceConfig:
        jointPropabilityConfig:
            type: BarlowLLH
```
could be broken into three files:

- topConfig.yaml
```yaml
minGundamVersion: 2.0.0
fitterEngineConfig:
    minimizerConfig: "./minimizerConfig.yaml"
    likelihoodInterfaceConfig: "./likelihoodConfig.yaml"
```
  - minimizerConfig.yaml
```yaml
type: RootMinimizer
minimizer: Minuit2
```

  - likelihoodConfig.yaml
```yaml
jointPropabilityConfig:
    type: BarlowLLH
```

### Top Level Configuration Options.

| Option | Type | Description | Default |
|------------------------------------------|--------|------------------------------------------------|---------|
| [fitterEngineConfig](#fitterengineconfig)    | json   | FitterEngine config                            |         |
| minGundamVersion (the format is "v.r.p") | string | gundamFitter will stop if the version is lower |         |
| outputFolder                             | string | Folder where the output file is written        | ./      |

## FitterEngineConfig

[< back to parent (gundamFitter)](run-gundam.md#gundamfitter)

### Description

### Config options

| FitterEngine Options                                | Type         | Description                                                                   | Default  |
|-----------------------------------------------------|--------------|-------------------------------------------------------------------------------|----------|
| [likelihoodInterfaceConfig](#likelihoodinterfaceconfig) | json         | Configure the likelihood calculation.                                         | required |
| [minimizerConfig](minimizers.md#configminimizerinterface)            | json         | MinimizerInterface config                                                     | required |
| [parameterScannerConfig](#parameter-scanner-config)       | json         | Scan parameters config                                                        |          |
| scanConfig                                          | json         | Deprecated. See parameterScannerConfig.                                       |          |
| propagatorConfig                                    | json         | Deprecated. See likelihoodInterfaceConfig/propagatorConfig                    |          |
| mcmcConfig                                          | json         | Deprecated. See minimizerConfig                                               |          |
| engineType                                          | string       | Deprecated. See minimizerConfig/type                                          |          |
| enablePreFitScan                                    | bool         | Run fit parameter scan right before the minimization                          | false    |
| enablePostFitScan                                   | bool         | Run fit parameter scan right after the minimization                           | false    |
| enablePreFitToPostFitLineScan                       | bool         | Run scan between the prefit and postfit parameters                            | false    |
| generateSamplePlots                                 | bool         | Draw sample histograms according to the PlotGenerator config                  | true     |
| allParamVariations                                  | list(double) | List of points to perform individual parameter variation                      |          |
| enablePca / runPcaCheck / fixGhostFitParameters     | bool         | Dangerous: Fix parameter if the effect on stat LHH is lower than `pcaDeltaChi2Threshold` | false    |
| pcaThreshold                                        | double       | LLH threshold for PCA                                                         | 1E-6     |
| fixGhostEigenParametersAfterFirstRejected           | bool         | Fix all next parameters once PCA has been triggered (dev)                     | false    |
| throwMcBeforeFit                                    | bool         | Push MC parameter away from their prior before fitting                        | false    |
| throwMcBeforeFitGain                                | int          | Scale throws for MC parameters                                                | 1        |
| customFitParThrow*                                  | list         | Use the custom thrown values for parameters (dev)                             |          |
| scaleParStepWithChi2Response                        | bool         | Use LLH profile to scale parameter step size (dev)                            | false    |
| parStepGain                                         | bool         | Boost step value with `scaleParStepWithChi2Response` (dev)                    | 0.1      |
| savePostfitEventTrees                               | bool         | Save event tree after the fit.                                                | false    |

### JSON sub-structures

#### customFitParThrow options

| Options         | Type | Description                           | Default |
|-----------------|------|---------------------------------------|---------|
| **parIndex**    | int  | Parameter index to move               |         |
| **nbSigmaAway** | int  | Custom throw value (in unit of sigma) |         |

## LikelihoodInterfaceConfig
[< back to parent (fitterEngineConfig)](#fitterengineconfig)

### Description

Define how the likelihood will be calculated.  This includes defining the
datasets that will be used for the model and measurement.  It also includes
defining the "propagator" that will apply the effect of fitting parameters
to the model.  The comparison between the measurement and model is defined
using `jointProbabilityConfig`.

### Config options

| Likelihood Interface Options        | Type | Descriptions                                | default   |
|-------------------------------------|------|---------------------------------------------|-----------|
| [propagatorConfig](#propagator-configuration) | Json | Configure the parameter propagation         |           |
| dataSetList                         | Json | Configure the input data sets               |           |
| jointProbabilityConfig              | Json | Configure the joint probability calculation | BarlowLLH |
| plotGeneratorConfig                 | Json |                                             |           |
| enableStatThrowInToys               | bool |                                             |           |
| gaussStatThrowInToys                | bool |                                             |           |
| enableEventMcThrow                  | bool |                                             |           |

## Propagator Configuration

[< back to parent (likelihoodInterfaceConfig)](#likelihoodinterfaceconfig)

### Description

The propagator handles the engine in charge of applying parameters to the
samples.  It owns the parameters, the samples, and the data loader.

### Config options

| Option                                                      | Type       | Description                                                                                | Default |
|-------------------------------------------------------------|------------|--------------------------------------------------------------------------------------------|---------|
| [sampleSetConfig](#sampleset)                             | json       | Configure the samples that will be compared data vs model                                  |         |
| [parametersManagerConfig/parameterSetList](parameters-and-dials.md#parametersetlist) | json       | Configure the parameters that will affect the model                                        |         |
| [parameterInjection/parameterSetList](parameters-and-dials.md#parametersetlist)      | list(json) | Override values for the parameters                                                         |         |
| showNbEventParameterBreakdown                               | bool       | Print the number of event affected by each parameter                                       | false   |
| showNbEventPerSampleParameterBreakdown                      | bool       | Print the number of event per sample affected by each parameter                            | false   |
| globalEventReweightCap                                      | double     | Will cap the weight applied by the parameters: evWeight = baseWeight * min(parWeight, cap) | nan     |
| debugPrintLoadedEvents                                      | bool       | If true then print contents for a set of events.                                           | false   |
| debugPrintLoadedEventsNbPerSample                           | int        | Number of events to dump in the debugPrintLoadedEvents output                              | 5       |
| devSingleThreadReweight                                     | bool       | Use a single thread for reweighting events with the CPU                                    | false   |
| devSingleThreadHistFill                                     | bool       | Use a single thread for filling the histograms with the CPU                                | false   |

## DatasetDefinition

[< back to parent (Propagator)](#propagator-configuration)

### Description

Defines how the data should be loaded to the samples.
Each config entry refers to a data set.

### Config options

As an entry list

| Option                               | Type   | Description                                                         | Default |
|--------------------------------------|--------|---------------------------------------------------------------------|---------|
| name                                 | string | Name of the dataset                                                 |         |
| mc (see bellow)                      | json   | Config for the MC entry                                             |         |
| data (see bellow)                    | json   | Config list for the Data entries                                    |         |
| selectedDataEntry                    | string | Name of the 'data' entry that should be used to load data events    | Asimov  |
| selectedToyEntry                     | string | Name of the 'data' entry that should be used to perform a toy fit   | Asimov  |
| isEnabled                            | bool   | Specify if it should be considered during the runtime               | true    |
| showSelectedEventCount               | bool   | Show the number of events passing the selection cut for each sample | true    |
| devSingleThreadEventSelection        | bool   | Force the event selection to be performed in single thread          | false   |
| devSingleThreadEventLoaderAndIndexer | bool   | Force the event loading to be performed in single thread            | false   |


#### mc

| Option                  | Type                | Description                                                     | Default |
|-------------------------|---------------------|-----------------------------------------------------------------|---------|
| tree                    | string              | Name of the TTree containing the data in each file              |         |
| selectionCutFormula     | string              | Global selection cut (should return 0 if not selected)          |         |
| nominalWeightFormula    | string/list(string) | Formula that returns the base weight of a given event           |         |
| filePathList            | list(string)        | list of ROOT files containing the TTree                         |         |
| additionalLeavesStorage | list(string)        | list of variables to be stored in memory                        |         |
| variablesTransform      | list(json)          | list of transform operations that will be applied while loading |         |
| variableDict        | list(json)          | dictionary translating a leaf/formula to variable name          |         |
| fromHistContent         | json                | use hist bin content directly. This will create dummy events    |         |


#### data

All options from MC

| Option                   | Type   | Description                                                                                                                     | Default |
|--------------------------|--------|---------------------------------------------------------------------------------------------------------------------------------|---------|
| name                     | string | Name of the data/toy entry                                                                                                      |         |
| fromModel                | bool   | Use config from model as a base for a data entry                                                                                | false   |
| useReweightEngine        | bool   | Force to load the dials while loading the data. Used for custom toys that use the reweight engine for generating the histograms | false   |
| evalModelAt              | json   | Specify which sets of parameters to eval the model and copy the events from. Parameter injector format                          |         |
| overridePropagatorConfig | json   | Use a custom set of config option that will override the propagator config. Any parameter can be changed from here              |         |

## SampleSet

[< back to parent (Propagator)](#propagator-configuration)

### Description

### Config options

| Option                          | Type       | Description                                               | Default    |
|---------------------------------|------------|-----------------------------------------------------------|------------|
| [fitSampleList](#sample) | list(json) | list of Sample config                                  |            |
| llhStatFunction                 | string     | name of the stat. LLH function                            | PoissonLLH |

### llhStatFunction entries

 - PoissonLLH
 - BarlowLLH
 - BarlowLLH_BANFF_OA2020
 - BarlowLLH_BANFF_OA2021 -> adds `llhConfig` option containing:

| Option               | Type | Description          | Default |
|----------------------|------|----------------------|---------|
| usePoissonLikelihood | bool | replica of the BANFF | false   |
| BBNoUpdateWeights    | bool | replica of the BANFF | false   |


 - Plugin (see `llhSharedLib` option)

| Option       | Type   | Description                                                     | Default |
|--------------|--------|-----------------------------------------------------------------|---------|
| llhSharedLib | string | path to the shared library (.so) with custom LLH function (dev) |         |

## Sample

[< back to parent (SampleSet)](#sampleset)

### Description

### Config options


| Option        | Type         | Description                               | Default |
|---------------|--------------|-------------------------------------------|---------|
| **name**      | string       | sample name                               |         |
| isEnabled     | bool         | include the sample in the propagator      | true    |
| binning       | string       | path to binning definition file           |         |
| selectionCuts | string       | tree selection formula                    |         |
| datasets      | list(string) | list of dataset will populate this sample | `{"*"}` |
| mcNorm        | double       | MC sample global normalisation            | 1       |
| dataNorm      | double       | data sample global normalisation          | 1       |

## PlotGenerator

[< back to parent (Propagator)](#propagator-configuration)

### Description

### Config options
Note that the leaf used in the `varDictionnaries` must be an int.

### Example

```yaml
varDictionnaries:
  - name: "reaction"
    dictionary:
      - { value: -1, title: "no truth", color: 1 } # kBlack
      - { value: 0, title: "CCQE", color: 801 } # kOrange+1
      - { value: 1, title: "RES", color: 413 } # kGreen-3
      - { value: 2, title: "DIS", color: 843 } # kTeal+3
      - { value: 3, title: "COH", color: 867 } # kAzure+7
      - { value: 4, title: "NC", color: 430 } # kCyan-2
      - { value: 5, title: "CC-#bar{#nu}_{#mu}", color: 593 } # kBlue-7
      - { value: 6, title: "CC-#nu_{e}, CC-#bar{#nu}_{e}", color: 602 } # kBlue+2
      - { value: 7, title: "out FV", color: 909 } # kPink+9
      - { value: 9, title: "2p2h", color: 634 } # kRed+2
      - { value: 777, title: "sand #mu", color: 920 } # kGray
      - { value: 999, title: "other", color: 922 } # kGray+2

histogramsDefinition:
  - varToPlot: "Raw"

  - varToPlot: "Pmu"
    splitVars: ["", "reaction"]
    useSampleBinning: true # if not possible, error
    rescaleAsBinWidth: true # default true -> to look like a PDF
    rescaleBinFactor: 30 
    xMax: 3000.
    xTitle: "p_{#mu} (MeV)"
    yTitle: "Counts"

  - varToPlot: "CosThetamu"
    splitVars: ["", "reaction"]
    useSampleBinning: true # if not possible, error
    rescaleAsBinWidth: true # default true -> to look like a PDF
    rescaleBinFactor: 1 
    xMax: 1.
    xTitle: "cos#theta_{#mu}"
    yTitle: "Counts"

canvasParameters:
  height: 800
  width: 1200
  nbXplots: 3
  nbYplots: 2
```

## EventTreeWriter

[< back to parent (Propagator)](#propagator-configuration)

### Description


### Config options

| Option                                         | Type | Description                                                         | Default |
|------------------------------------------------|------|---------------------------------------------------------------------|---------|
| writeDials                                     | bool | If true, then save a TGraph for each dial in each even              | false   |
| nPointsPerDial                                 | int  | The number of points to use between +5 and -5 sigma                 | 3       |

## Parameter Scanner Config

[< back to parent (FitterEngine)](#fitterengineconfig)

### Scan options

| scanConfig Options  | Type         | Description                                         | Default |
|---------------------|--------------|-----------------------------------------------------|---------|
| nbPoints            | int          | N sample point of LLH scan                          | 100     |
| parameterSigmaRange | list(double) | Scan around the current point at +/- X prior sigmas | {-3, 3} |
| varsConfig          | json         | List of quantities to scan                          |         |
| useParameterLimits  | bool         | Don't scan LLH out of bounds                        | true    |


### Scan/Vars options

| varsConfig Options     | Type | Description                                | Default |
|------------------------|------|--------------------------------------------|---------|
| llh                    | bool | Save total LLH scans                       | true    |
| llhStat                | bool | Save stat. LLH scans                       | true    |
| llhPenalty             | bool | Save penalty LLH scans                     | true    |
| llhStatPerSample       | bool | Save stat. LLH per sample scans            | false   |
| llhStatPerSamplePerBin | bool | Save stat. LLH per sample per bin scans    | false   |
| weightPerSample        | bool | Save total weight per sample scans         | false   |
| weightPerSamplePerBin  | bool | Save total weight per sample per bin scans | false   |
