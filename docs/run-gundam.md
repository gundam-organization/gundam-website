# Run GUNDAM

## Overview

There are several applications that can be run within GUNDAM. The primary purpose of GUNDAM is to perform fits to experimental or simulated data by varying sets of underlying model parameters using the `gundamFitter` application. Additionally, GUNDAM can be used for cross-section data analysis through the `gundamCalcXsec` application. There is also a set of additional applications with various goals.

- [Run gundamFitter](#gundamfitter)

- [Run gundamCalcXsec](#gundamcalcxsec)

- Other GUNDAM applications:

  - [gundamConfigCompare](#gundamconfigcompare)
  - [gundamConfigUnfolder](#gundamconfigunfolder)
  - [gundamFitPlot](#gundamfitplot)
  - [gundamFitReader](#gundamfitreader)
  - [gundamInputZipper](#gundaminputzipper)
  - [gundamPlotExtractor](#gundamplotextractor)
  - [gundamRoot](#gundamroot)

## gundamFitter

### Description

The `gundamFitter` app is an interface to the `FitterEngine` which is in charge
of setting up datasets, samples, fit parameters according to a provided config
file.

The list of options can be displayed by running `gundamFitter` without command
line arguments. The program should immediately stop after complaining that no
config file was provided.

### Usage

Most inputs are define in the  fitter config file and are called using the `-c` argument followed by the path to corresponding configuration file. 
```bash
gundamFitter -c path/to/config.yaml
```
Config files can be written in the `.yaml` format or `.json`. Alternatively one cans use [gundamConfigUnfolder](#gundamconfigunfolder) to convert `.yaml` inputs into one `.json`. 

The number of parallel threads used by the fit can be defined by using the `-t` argument as follows:
```bash
gundamFitter -c path/to/config.yaml -t 15
```

If not specified in the config files one can also provide the path to the output file with the `-o` argument:
```bash 
gundamFitter -c path/to/config.yaml -o path/to/output.root -t 15
```

Override files can be past as arguments with `-of` to override default config without having to modify it:
```bash
gundamFitter -c path/to/config.yaml -o path/to/output.root -of path/to/override.yaml -t 15
```

### Trigger options

A certain number of trigger options can be used depending  on what the user needs:

| Option           | Description                                                                              |
| ---------------- | ---------------------------------------------------------------------------------------- |
| -d               | Perform the full sequence of initialization, but don't do the actual fit.                |
| -a               | Use MC dataset to fill the data histograms                                               |
| --pca            | Enable principle component analysis for eigen decomposed parameter sets                  |
| --skip-hesse     | Don't perform postfit error evaluation                                                   |
| --skip-simplex   | Don't run SIMPLEX before the actual fit                                                  |
| --kick-mc        | Push MC parameters away from their prior to help the fit converge                        |
| --one-sigma      | Generate one sigma plots                                                                 |
| --light-mode     | Disable plot generation                                                                  |
| --no-dial-cache  | Disable cache handling for dial eval                                                     |
| --ignore-version | Don't check GUNDAM version with config request                                           |
| --scan           | Enable parameter scan before and after the fit (can provide nSteps)                      |
| ---scan-line     | Provide par injector files: start and end point or only end point (start will be prefit) |
| --toy            | Run a toy fit (optional arg to provide toy index)                                        |

For a complete list of options run command without arguments.

### Config options

| Option                                                 | Type   | Description                                    | Default |
| ------------------------------------------------------ | ------ | ---------------------------------------------- | ------- |
| [fitterEngineConfig](configuration.md#fitterengineconfig) | json   | FitterEngine config                            |         |
| minGundamVersion                                       | string | gundamFitter will stop if the version is lower |         |
| outputFolder                                           | string | Folder where the output file is written        | ./      |

## gundamCalcXsec

### Description

The `gundamCalcXsec` app is an interface to the `FitterEngine` which is in charge of performing a Cross Section calculation by taking the output of `gundamFitter` as input. 

### Usage

Similarly to [gundamFitter](#gundamfitter), `gundamCalcXsec` takes a config file as input with `-c` but in addition it also takes the output of `gundamFitter` as an input with the `-f` argument.
```bash
gundamCalcXsec -c path/to/xsecconfig.yaml -f path/to/outputfit.root - path/to/output.root -t 12
```
Where `-o` and `-t` are the arguments for the output file path and the number of parallel threads respectively. 

In addition one can use `-n` and `-s` to specify the number of toys and to set a random seed respectively in the fit. 
```bash
gundamCalcXsec -c path/to/xsecconfig.yaml -f path/to/outputfit.root - path/to/output.root -t 12 -n 100 -s 5
```
### Trigger options

A certain number of trigger options can be used depending  on what the user needs:

| Option          | Description                                          |
| --------------- | ---------------------------------------------------- |
| -d              | Only overrides fitter config and prints it.          |
| -use-bf-as-xsec | Use best-fit as x-sec value instead of mean of toys. |
| --use-prefit    | Use prefit covariance matrices for the toy throws.   |

For a complete list of options run command without arguments.

### Config options

| Option                                                 | Type         | Description                                                     | Default |
|--------------------------------------------------------|--------------|-----------------------------------------------------------------|---------|
| [fitterEngineConfig](configuration.md#fitterengineconfig) | json         | FitterEngine config                                             |         |
| minGundamVersion                                       | string       | gundamFitter will stop if the version is lower                  |         |
| outputFolder                                           | string       | Folder where the output file is written                         | ./      |

## Other GUNDAM applications

### gundamConfigCompare

#### Description 

The `gundamConfigCompare` app compares the elements in two config files. This app will output the differences it finds in the respective files and print out warnings if certain elements are present in one and not the other.

#### Usage

It takes the path to each config file as arguments as follows:
```bash
gundamConfigCompare -c1 path/to/config1.yaml -c2 path/to/config2.yaml
```
Config files can either be in `.yaml` or `.json` format and used interchangeably. 

Override files can also be provided as inputs:
```bash 
gundamConfigCompare -c1 path/to/config1.yaml -c2 path/to/config2.yaml -of1 path/to/override1.yaml -of2 path/to/override2.yaml 
```

Additionally one can use the `-a` argument to show all the keys being compared.

### gundamConfigUnfolder

#### Description 

The `gundamConfigUnfolder` app takes a config file and and exports all related config files into one `.json` that can be used as an input for other apps that use said input.

#### Usage

Using the `-c` argument one provides the `.yaml` or `.json` config file:
```bash
gundamConfigUnfolder -c path/to/config.yaml -o path/to/output.json
```

One can also include an override file with `-of` to include config override.
```bash
gundamConfigUnfolder -c path/to/config.yaml -of path/to/override.yaml -o path/to/output.json
```

### gundamFitCompare

#### Description 

The `gundamFitCompare` app that takes as input the output of [gundamFitter](#gundamfitter) to produce comparison plots of the respective fit results. 

#### Usage

One has to use the arguments `-f1` and `-f2` to specify the input fit files. Then using `-n1` and `-n2` names the fits respectively and lastly using `-a1` and `-a2` chooses the algorithm to compare (Migrad, Hesse, etc).
```bash
gundamFitCompare -f1 path/to/fit1.root -f2 path/to/fit2.root -n1 fit1 -n2 fit2 -a1 Hesse -a2 Hesse -o path/to/compare.root
```
The argument `-o` specifiers where the output compare file is saved. 

#### Trigger options

A certain number of trigger options can be used depending  on what the user needs:

| Option     | Description                      |
| ---------- | -------------------------------- |
| --prefit-1 | Use prefit data only for file 1. |
| --prefit-2 | Use prefit data only for file 2. |
| --tree     | Comparing loaded events in tree. |
| -v         | Recursive verbosity printout.    |

### gundamFitPlot

#### Description 

The `gundamFitPlot` app is used to compare the constraints of several fits.

#### Usage

```bash
gundamFitPlot -c path/to/config.yaml -o path/to/output.root
```

### gundamFitReader

#### Description 

The `gundamFitReader` app reads the fit output file from [gundamFitter](#gundamfitter) and prints out relevant fit information. 
#### Usage

Using the `-f` argument the user can specify the input fit file.
```bash
gundamFitReader -c path/to/fit.root 
```
Similarly using the `-e` trigger and the `-o` option, the output can be written in the a ROOT file.
```bash
gundamFitReader -c path/to/fit.root -e -o path/to/output.root
```
#### Trigger options

A certain number of trigger options can be used depending  on what the user needs:

| Option          | Description                                        |
| --------------- | -------------------------------------------------- |
| -e              | Export data to output files                        |
| --show-par-list | Show parameters list                               |

### gundamInputZipper

#### Description 

The `gundamInputZipper` app reads in the config inputs and copies the inputs into a unified ZIP file. 
#### Usage

Using the `-c` and `-of` arguments one can point to the desired config:
```bash
gundamInputZipper -c path/to/config.yaml -of path/to/override.yaml
```
This will create a directory with the same name as the config file.

Otherwise one can specify the name of the output with `-o` 
```bash 
gundamInputZipper -c path/to/config.yaml -of path/to/override.yaml -o output/
```

In addition, the user can define the maximum size (in MB) of the file with `--max-size` and zip the output folder with `-z`:
```bash
gundamInputZipper -c path/to/config.yaml -of path/to/override.yaml -o output/ -z --max-size 50
```

### gundamPlotExtractor

#### Description 

The `gundamPlotExtractor` app extracts plots from the output of [gundamFitter](#gundamfitter) into a designated diretory. 

#### Usage

The user can pass the fit file with the `-f` argument alongside `-o` to define the output folder.
```bash
gundamPlotExtractor -f path/to/fit.root -c output/directory/
```

By default plots are saved as `.pdf` but one can define the extension with `-x` (ex. png, jpeg, svg).
```bash
gundamPlotExtractor -f path/to/fit.root -c output/directory/ -x png
```

### gundamRoot

#### Description 

The `gundamRoot` app is an interactive ROOT session that includes `GUNDAM`'s funcionality.
#### Usage

```bash
gundamRoot 
```
