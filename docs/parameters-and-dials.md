# Parameters and Dials

## parameterSetList

[< back to parent (propagatorConfig)](configuration.md#propagator-configuration)

### Description

Parameter sets contain lists of parameters that are grouped together by the
fit, and which may share a prior covariance matrix.  Examples parameter
sets might be "oscillation parameters", "flux systematics", "cross section
systematics", and "detector systematics", but GUNDAM handles them all the
same, so you can use any name, and assign any meaning to the different
sets.  Parameter set lists occur in two contexts.  The parameters are
defined in the parametersManagerConfig which will have the syntax in the
YAML file of

```yaml
parametersManagerConfig:
    parameterSetList:
        - name: "First set"
          <and so on>
```

The other context is the through the `parameterInjection` which follows the
same syntax, and provides a way to explicitly set the value of the
parameters (primarily to override the values in the
parametersManagerConfig.

Each parameter set is defined using the fields in the next section.  The
`name` is the only required field in a parameter set, however at least one
parameter must be defined.  Parameters are defined by using the
`parameterDefinitions` which will contain a list of parameter definitions.
Parameters can also be defined using a prior covariance matrix, and vectors
of parameter names, prior values, and bounds (see `covarianceMatrix`,
`parameterNameList`, and `parameterPriorValueList`).

The event reweighting dials that depend on the parameters should be defined
in the `dialSetDefinitions`.  This defines all of the event reweighting
associated with this set of parameters.  For simple sets of parameters
(which only have one parameter per dial), the dial definitions can be
defined as part of the `parameterDefinitions`, but this practice is
discouraged.  If multi-dimensional dials are used, then a dialSetDefinition
is required.

If a parameter set has a prior covariance, it may be decomposed, and it's
eigen vectors can be used as the effective fit parameters.  This is
primarily needed with the prior covariance is singular (i.e. it has
extremely large correlations between parameters).  In this case, the
`eigenValueThreshold` may be set to ignore very small parameters.
Typically a singular covariance matrix will have one (or several) eigen
values that are approximately zero (e.g. with a magnitude of about 1E-14),
so an `eigenValueThreshold` of 1E-12 is usually appropriate.

### Parameter set config options

| Field                                | Type             | Description                                                  | Default |
|--------------------------------------|------------------|--------------------------------------------------------------|---------|
| name                                 | string           | Required: The parameter set name                             |         |
| [parameterDefinitions](#parameter) | list(Json)       | The list parameters that are part of this set                |         |
| [dialSetDefinitions](#dial-definition)        | list(Json)       | The list of "dials" that modify the model                    |         |
| isEnabled                            | bool             | Is the set is enabled for the fit                            |         |
| isScanEnabled                        | bool             | Should the set be "scanned" by the parameter scanner         |         |
| nominalStepSize                      | double           | The step scale used by the minimizer                         | 1.0     |
| printDialSetSummary                  | bool             | Should the dial set summary be printed                       | false   |
| printParameterSummary                | bool             | Should the parameter set summary be printed                  | false   |
| parameterLimits                      | [double, double] | Define a range for all parameters in this set                |         |
| enablePca                            | bool             | Fix parameter if 1 sigma scan doesn't change LLH (DANGEROUS) | false   |
| enableThrowToyParameters             | bool             | This set should be thrown when generating toy data           | true    |
| releaseFixedParametersOnHesse        | bool             | Fixed parameters are considered for HESSIAN                  | false   |
| parameterDefinitionFilePath          | string           | Name of a file defining parameters and covariance            | empty   |
| covarianceMatrix                     | string           | Name of TH2D covariance in parameter definition file         | empty   |
| parameterNameList                    | string           | Name of TObjArray of strings for parameter names             | empty   |
| parameterPriorValueList              | string           | Name of TVectorD with prior values for each parameter        | empty   |
| parameterLowerBoundsList             | string           | Name of TVectorD with parameter lower bounds                 | empty   |
| parameterUpperBoundsList             | string           | Name of TVectorD with parameter lower bounds                 | empty   |
| enableOnlyParameters                 | list             | List of enabled parameter for this set (others disabled)     | empty   |
| disableParameters                    | list             | List of disabled parameters for this set (others enabled)    | empty   |
| useEigenDecompForThrows              | bool             | Throw toys in eigen decomposed basis                         | false   |
| enableEigenDecomp                    | bool             | Eigen decompose the prior covariance matrix                  | false   |
| allowEigenDecompWithBounds           | bool             | Allow bounds to be ignored when eigen decomposing            | false   |
| maxNbEigenParameters                 | int              | Only use this many eigen parameters                          | inf     |
| maxEigenFraction                     | double           | Fraction of total "eigen" power to use                       | 1.0     |
| eigenValueThreshold                  | double           | Ignore eigenvectors with eigenvalues below this threshold    | 0.0     |

### JSON sub-structures

#### parameterDefinitions

The `parameterDefinitions` field holds a list that defines the parameters that are part of this set.  The fields for each [parameter](#parameter) vary depending on the circumstances, but each definition must contain a parameter name.  For example
```yaml
parameterDefinitions:
    - parameterName "First Parameter"
      <other fields>

    - parameterName "Second Parameter"
      <other fields>
```

#### dialSetDefinitions

The `dialSetDefinitions` field holds a list that the defines the dials which translate the parameters into event weights.  The fields for each [dial](#dial-definition) vary depending on the dial type, but each dial must contain the `dialType`, and the parameter names (in `dialInputList`) that are used.
```yaml
dialSetDefinitions:
    - dialType: "Spline"
      dialInputList:
          - name: "First Parameter"
          - name: "Second Parameter"
      <other fields>
```

#### parameterLimits options

| Options  | Type   | Description                          | Default |
|----------|--------|--------------------------------------|---------|
| minValue | double | min value of parameters from the set | -inf    |
| maxValue | double | max value of parameters from the set | +inf    |

## Parameter

[< back to parent (ParameterSet)](#parametersetlist)

### Description

Define a parameter of the fit.  The parameter should have a name,
but you can use the index instead (not encouraged).  Notice that
parameters with a Gaussian prior must be associated with a
covariance matrix.  It is not currently possible to specifically
define parameters with a Gaussian constraint, but without a
covariance.

### Config options

| Option                           | Type         | Description                           | Default      |
|----------------------------------|--------------|---------------------------------------|--------------|
| name                             | string       | define parameter with name (expected) |              |
| parameterIndex                   | int          | define parameter with index           |              |
| priorType                        | string       | penalty shape (Gaussian/Flat)         | Gaussian     |
| priorValue                       | double       | prior value (expected)                | nan          |
| isEnabled                        | bool         | use parameter in the propagator       | true         |
| isFixed                          | bool         | use parameter in the propagator       | false        |
| isThrown                         | bool         | throw parameter when generating toy   | false        |
| parameterStepSize                | double       | Expected scale of the variation       | 1.0          |
| parameterLimits                  | pair(double) | minimum and maximum for the domain    | [-inf, +inf] |
| physicalLimits                   | pair(double) | minimum and maximum physical range    | [-inf, +inf] |
| throwLimits                      | pair(double) | minimum and maximum range to throw    | [-inf, +inf] |
| mirrorRange                      | pair(double) | boundaries for internal mirroring     | [-inf, +inf] |
| cyclicRange                      | pair(double) | boundaries of the cyclic interval     | [-inf, +inf] |
| [dialSetDefinitions](#dial-definition) | list(json)   | Only for single dimension dials       |              |

#### dialSetDefinitions

The `dialSetDefinitions` field holds a list that the defines the dials which translate the parameters into event weights.  The fields for each [dial](#dial-definition) vary depending on the dial type, but each dial must contain the `dialType`, and the parameter names (in `dialInputList`) that are used.
```yaml
dialSetDefinitions:
    - dialType: "Spline"
      dialInputList:
          - name: "First Parameter"
          - name: "Second Parameter"
      <other fields>
```

## Dial Definition

[< back to parent (ParameterSet)](#parametersetlist)

[< back to parent (ParameterSet)](#parameter)

### Description

Describe an element in a list of dials.  A dial describes how parameter
values should be translated into a weight that will be used to multiply
events that are part of the model.  All of the weights must be positive,
and will generally be bounded on the high-side (see `minDialResponse` and
`maxDialResponse`). GUNDAM provides several types of weighting functions
(both single and multiple dimensions), as well as the ability to call
external libraries to calculate weights.

### Config options that apply to all dials.

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| dialType               | string       | See below                                                              |         |
| dialSubType            | string       | See below                                                              | empty   |
| isEnabled              | bool         | Dial is not used if this is false                                      | true    |
| applyOnDataSets        | list(string) | list (regex) of datasets the corresponding dials will apply to         | `["*"]` |
| applyCondition         | string       | Only apply this dial with formula evaluates to non-zero                | empty   |
| applyConditions        | list(json)   | Multiple condition formulas (only apply dial if all are true) formulas | n/a     |
| minDialResponse        | double       | Minimum weight value returned by the dial response (should be zero)    | -inf    |
| maxDialResponse        | double       | Maximum weight returned by the dial (typically you want about ten)     | inf     |
| binningFilePath        | string       | binning definition of a set of spline (along with `dialsFilePath`)     |         |
| useMirrorDial          | bool         | enable dial mirroring along the edges                                  | false   |
| mirrorLowEdge          | double       | low edge where mirroring applies                                       |         |
| mirrorHighEdge         | double       | upper edge where mirroring applies                                     |         |
| allowDialExtrapolation | bool         | Allow splines to be extrapolated past the first and last knots         | false   |
| printDialsSummary      | bool         | extra verbose                                                          | false   |
| definitionRange        | pair(double) |                                                                        |         |
| mirrorDefinitionRange  | pair(double) |                                                                        |         |
| dialInputList          | list(json)   | List of parameters for this dial                                       | empty   |
| dialsTreePath          | string       | Deprecated: tree name where the dials are stored                       |         |

### Config options that apply to specific types of dials

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| dialLeafName           | string       | fetch dial from the dataset TTree with the corresponding leaf name     |         |
| dialsFilePath          | string       | root file containing the set of dials                                  |         |
| dialsList              | string       | path within root file to the list of dials                             |         |
| tableConfig            | json         | Definition of functions to call for Tabular dials                      | empty   |

### Configuration for different dial types

#### `dialType: Normalization`

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| parametersBinningPath  | string       | create a dedicated norm dial according to the parameter binning        |         |

Treat the parameter as a simple weight.  In this case, the parameter must be bounded to always be positive.

#### `dialType: Spline`

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| dialLeafName           | string       | fetch dial from the dataset TTree with the corresponding leaf name     |         |
| dialsFilePath          | string       | root file containing the set of dials                                  |         |
| dialsList              | string       | path within root file to the list of dials                             |         |

Translate a parameter value to a weight using an event-by-event spline (A
spline is a piece-wise continuous cubic function with continuous first and
second derivatives).  Each event for which this dial is applicable must
have a spline defined in the input file.  The spline will be contained in a
leaf named by the `dialLeaf`field, and must contain a TGraph or a TSpline3 object.
The `Spline` dial type can have several `dialSubType` values

- not-a-knot : Calculate the slopes using the "not-a-knot" criteria.  This
  is the default criteria used by the ROOT TSpline3 class. This guarantees
  that the third derivative at the first two and last two points is zero.
- natural : Calculate the slopes applying the "natural" criteria. This
  guarantees that the second derivatives at the end points will be zero.
- catmull-rom : Estimate the slopes using the Catmull-Rom criteria.  This
  uses the average slopes for the points before and after (also known as
  the "pixar" spline based on its use in animation.
- akima : Estimate the slopes using the Akima criteria.
- monotonic : Apply the monotonic critera to the slopes before they are
  used.  This applies to "not-a-knot", "natural" "catmull-rom", and "akima"
  splines.  In each case, the slopes are first estimated using the defined
  algorithm, and then the Fritsche-Carlson criteria is used to adjust the
  slopes so that the function is monotonic at every point, except for cusps
  where the slope will be zero.
- uniformity(tolerance) : A spline is considered to have uniform point
  spacing when the point spacing stays within this tolerance.  For example,
  `uniformity(1E-3)` means that the difference between the point to point
  spacings must stay below `1E-3`.

#### `dialType: Graph`

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| dialLeafName           | string       | fetch dial from the dataset TTree with the corresponding leaf name     |         |
| dialsFilePath          | string       | root file containing the set of dials                                  |         |
| dialsList              | string       | path within root file to the list of dials                             |         |

Translate a parameter value to a weight piece-wise linear function.  Be
very careful when using a Graph dial since graphs will usually have
discontinuous derivatives, and cannot be reliably used in a minimizer.  A
minimizer requires that the function value be continuous, and have
continuous first and second derivatives. The graph will be contained in a
leaf named by the `dialLeaf` field, and must contain a TGraph object.

#### `dialType: Surface`

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| dialLeafName           | string       | fetch dial from the dataset TTree with the corresponding leaf name     |         |
| dialsFilePath          | string       | root file containing the set of dials                                  |         |
| dialsList              | string       | path within root file to the list of dials                             |         |

Translate two parameter values into a surface.  The surface is defined in a
TH2 which is contained in a leaf named in the `dialLeaf`.  A surface dial
can have the following sub type fields

- Bilinear : Use bilinear interpolation between the points defined in the
  TH2.  The TH2 must define a regular grid of knots.
- Bicubic : Use bicubic interpolation between the points defined in the TH2
  The TH2 must define a regular grid of knots, and the bicubic
  interpolation is based on the catmull-rom definition.

#### `dialType: Tabulated`

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| tableConfig            | json         | Definition of functions to call for Tabulate dials                      | empty   |

Use a precalculated table of weights.  The table may be refilled for each
iteration of the fitter. The method of filling the table is defined using
the [tableConfig](#tabulated-dials) option.

#### `dialType: Kriged`

| Option                 | Type         | Description                                                            | Default |
|------------------------|--------------|------------------------------------------------------------------------|---------|
| tableConfig            | json         | Definition of functions to call for Kriged dials                      | empty   |

Use a precalculated table of weights.  The table may be refilled for each
iteration of the fitter. The method of filling the table is defined using
the [tableConfig](#tabulated-dials-1) option.

#### `dialType: Formula`

Apply a weight using a ROOT formula.  This is not fully supported since it
cannot be efficiently applied with GPU acceleration.

### applyConditions options

| Option                            | Type               | Description                                                      | Default |
|-----------------------------------|--------------------|------------------------------------------------------------------|---------|
| exp / expression / var / variable | string             | formula condition that applies on every dial of the set          |         |
| allowedRanges                     | list(pair(double)) | list of ranges (min, max) where the dials of the set apply       |         |
| excludedRanges                    | list(pair(double)) | list of ranges (min, max) where the dials of the set don't apply |         |
| allowedValues                     | list(double)       | list of values where the dials of the set apply                  |         |
| excludedValues                    | list(double)       | list of values where the dials of the set apply                  |         |

## Tabulated Dials

A tabulated dial provides an efficient way to do an event-by-event reweight
of an event based on a truth variable and fitting parameters.  It is an
efficient way to handle a one-dimensional lookup table. For instance, this
can be used for long and short baseline oscillation fits that are dependent
on the true neutrino energy.  The table will be refilled for each set of
oscillation parameters.  An external library is used declare a look up
table, to fill the table for each iteration, and look up the position of
each event in the table based on truth variables.

The yaml for a Tabulated Dial is

```YAML
dialSetDefinitions:
  - dialType: Tabulated
    printDialsSummary: true
    dialInputList:
      - name: <fit-parameter1-name>
      - name: <fit-parameter2-name>
    tableConfig:
        - name: <table-name>                A table name passed to the
                                               library.
          bins:  <number>                   The (optional) expected number
                                               of bins in the table. Will
                                               be overridden by the
                                               initFunction.
          libraryPath: <path-to-library>    Location of the library
          initFunction: <init-func-name>    Initialization function name
          initArguments: [<arg1>, ...]      List of argument strings (e.g.
                                               input file names)
          updateFunction: <update-func-name> Function called to update table
          binningFunction: <bin-func-name>  Function to find bin index
          binningVariables: [<var1>, <var2>, ... ] Variables used for binning
                                               the table "X" coordinates
```

### Function to initialize the library

If `initFunction` is provided it will be called before calling the update or the binning functions.  It is called with the signature:

```
    extern "C"
    int initFunc(const char* name,
                 int argc, const char* argv[],
                 int bins);
```
* name -- The name of the table
* argc -- number of arguments
* argv -- argument strings.  The arguments are defined by the library, but are usually things like input file names for the lookup table information.
* bins -- The suggested size the table.  The library must choose an appropriate binning that will be used for the table.

The function should less than or equal to zero for failure, and otherwise, the number of elements needed to store the table (usually, the same as the input value of "bins").

### Library function to update the table

The update function is called before the events are reweighted.  The `updateFunction` signature is:

```
    extern "C"
    int updateFunc(const char* name,
                   double table[], int bins,
                   const double par[], int npar);
```
* name  -- table name
* table -- address of the table to update
* bins  -- The size of the table
* par   -- The parameters.  Must match parameters define in the dial definition
* npar  -- number of parameters

The function should return 0 for success, and any other value for failure

The table will be filled with "bins" values calculated with uniform spacing between "low" and "high".  If bins is one, there must be one value calculated for "low", if bins is two or more, then the first point is located at "low", and the last point is located at "high".  The step between the bins is (high-low)/(bins-1).  Examples:
```
    bins = 2, low = 1.0, high = 6.0
       values calculated at 1.0 and 6.0
```
```
    bins = 3, low = 1.0, high = 6.0
       values calculated at 1.0, 3.5, and 6.0
```
While the update can (in principle) be done directly on the GPU, and have the table directly accessed by the Cache::Manager, the results must be copied back to the CPU so that the Propagator event weight calculation can be done.  The current implementation does not expose the methods to hand the table directly from the external library to the Cache::Manager kernels.  The calculation can also be done solely on the CPU, and the results will be copied to the GPU.

### Library function to index events

The binning function is called as the MC events are read into the internal structures, and return an index into the lookup table for an event.  The `binningFunction` signature is:
```
    extern "C"
    double binFunc(const char* name,
                   int nvar, const double varv[],
                   int bins);
```
* name -- table name
* nvar -- number of (truth) variables used to find bin
* varv -- array of (truth) variables used to find bin
* bins -- The number of bins in the table.

The function should return a double giving the fractional bin number greater or equal to zero and LESS THAN the maximum number of bins.  The  integer part determines the index of the value below the value to be interpolated, and the fractional part determines the interpolation between  the indexed bin, and the next.  This determines where to find the entry for  the input (truth) variables.

### Compiling the library

 The library should loadable by dlopen, so it needs be compiled with (at least)

`gcc -fPIC -rdynamic --shared -o <LibraryName>.so <source>`

## Tabulated Dials

A kriged dial provides an efficient way to do an event-by-event reweight of
an event based on a truth variable and fitting parameters when the lookup
is indexed by more than one truth variable. For instance, this can be used
for atmospheric neutrino oscillation probability tables where the event
probability depends on both the neutrino direction, and the neutrino
energy.  The table will be refilled fore each set of oscillation
parameters.  An external library is used declare a look up table, to fill
the table for each iteration, and look up the position of each event in the
table based on truth variables.

The yaml for a Tabulated Dial is

```YAML
dialSetDefinitions:
  - dialType: Tabulated
    printDialsSummary: true
    dialInputList:
      - name: <fit-parameter1-name>
      - name: <fit-parameter2-name>
    tableConfig:
        - name: <table-name>                A table name passed to the
                                               library.
          bins:  <number>                   The (optional) expected number
                                               of bins in the table. Will
                                               be overridden by the
                                               initFunction.
          libraryPath: <path-to-library>    Location of the library
          initFunction: <init-func-name>    Initialization function name
          initArguments: [<arg1>, ...]      List of argument strings (e.g.
                                               input file names)
          updateFunction: <update-func-name> Function called to update table
          weightFunction: <bin-func-name>  Function to find bin index
          weightVariables: [<var1>, <var2>, ... ] Variables used to fill
                                               the arrays of table indices
                                               and constants used to calculate
                                               the event weight
```

### Function to initialize the library

If `initFunction` is provided it will be called before calling the update or the binning functions.  It is called with the signature:

```
    extern "C"
    int initFunc(const char* name,
                 int argc, const char* argv[],
                 int bins);
```
* name -- The name of the table
* argc -- number of arguments
* argv -- argument strings.  The arguments are defined by the library, but are usually things like input file names for the lookup table information.
* bins -- The suggested size the table.  The library must choose an appropriate binning that will be used for the table.

The function should return less than or equal to zero for failure, and otherwise, the number of elements needed to store the table (usually, the  same as the input value of "bins").

### Library function to update the table

The update function is called before the events are reweighted.  The `updateFunction` signature is:

```
    extern "C"
    int updateFunc(const char* name,
                   double table[], int bins,
                   const double par[], int npar);
```
* name  -- table name
* table -- address of the table to update
* bins  -- The size of the table
* par   -- The parameters.  Must match parameters define in the dial definition
* npar  -- number of parameters

The function should return 0 for success, and any other value for failure

While the update can (in principle) be done directly on the GPU, and have the table directly accessed by the Cache::Manager, the results must be copied back to the CPU so that the Propagator event weight calculation can be done.  The current implementation does not expose the methods to hand the table directly from the external library to the Cache::Manager kernels.  The calculation can also be done solely on the CPU, and the results will be copied to the GPU.

### Library function to look up the events

The weight function is called as the MC events are read into the internal structures, and returns the indices and weights to use for an event.  The `weightFunction` signature is:
```
    extern "C"
    int weightFunc(const char* name, int bins,
                   int nvar, const double varv[],
                   int maxEntries,
                   int index[], double weights[]);
```
* name -- table name
* bins -- number of entries in the look up table
* nvar -- number of (truth) variables used to find bin
* varv -- array of (truth) variables used to find bin
* maxEntries -- The space allocated for index and weights
* index[] -- (output) an array filled with the index values used to weight
                 the event.  It must hold at least `maxEntries` values
* weights[] -- (output) an array filled with the weights to be applied the
                 the table entries referenced in the index array.  It must
                 hold at least `maxeEntries` values.

The function should return an int giving the number of entries that were filled in the index array.  The index and weights arrays are "parallel", so the first element of the index array is the index in the table that the weight in the first element of the weight array will be applied to.  The pseudocode for the event weight calculation is
```
double weight = 0;
for (int i=0; i<entries; ++i) weight += weights[i]*table[index[i]];
```

### Compiling the library

 The library should loadable by dlopen, so it needs be compiled with (at least)

`gcc -fPIC -rdynamic --shared -o <LibraryName>.so <source>`
