# Extra shader options

## Developer usage

Configuration is mostly done through the `shaders.properties` file, every extra
setting lives under the `extra` namespace. Currently you can define the
following:

### Identifier

Make sure to set this if you want your shader to participate in the custom
profile system.

```bash
extra.identifier = <Your unique identifier>

# Example (please don't actually name it like this):
extra.identifier = my-awesome-shader
```

The identifier has the following rules:

-   It has to be unique.
-   It should be readable, if someone just sees the identifier they should be
    able to tell what shader it belongs to.
-   It has to stay constant once you've chosen one (otherwise data associated
    with your pack will be soft-reset).
-   It can only contain lowercase latin letters and dashes and it has to start
    with a letter.
-   It can't contain any vulgarity.

Ideally the identifier should be the name of your shader in lowercase with
spaces replaced by dashes, for instance the shader `My awesome shader` would
become `my-awesome-shader`.

If you have to change it in the future, you can contact me, but I keep my rights
to refuse the request if I feel it's abusing the system.

Getting around these rules will result in a permanent ban from the service.

### Direct linking

Direct linking lets you link to an editor already initialized with a shader from
Modrinth. Use the following link for this:

```bash
https://editor.balintcsala.com/?shader=<your shader slug>
# Optional: Specify the version:
https://editor.balintcsala.com/?shader=<your shader slug>&version=<version number>

# Example
https://editor.balintcsala.com/?shader=my_awesome_shader
https://editor.balintcsala.com/?shader=my_awesome_shader&version=1.0.3
```

If you don't know your shader slug, go to the main page of your shader on
modrinth and copy the last section, e.g. if the link is
`modrinth.com/shader/my_awesome_shader` you want `my_awesome_shader`.

This option won't let users download the shader, only export shader settings.

### App color scheme

Lets you select the colors of the shader editor website. All color schemes are
monochromatic.

```
extra.colorScheme = <Color scheme>
```

Available options:

-   slate
-   red
-   orange
-   amber
-   lime
-   emerald
-   blue
-   indigo
-   purple
-   pink

This is a subset of the tailwindcss colors, refer to
[these docs](https://tailwindcss.com/docs/customizing-colors) to see what the
color options are.

### Colors

This option lets you wrap three RGB sliders into a single color selector. The
sliders for the green and blue components will be removed from every screen they
are part of and the red slider will be replaced by the color selector. The
selector assumes a range of [0, 1] on all three sliders.

```perl
extra.colors.<New option name> = <Red option name> <Green option name> <Blue option name>

# Example:
extra.colors.SKY_COLOR = SKY_COLOR_R SKY_COLOR_G SKY_COLOR_B
```

#### Language support

```perl
# shaders/lang/en_us.lang
option.SKY_COLOR = Sky color
option.SKY_COLOR.comment = The color of the sky.
```

`value`-s are not supported.

### Removing empty spaces

If you added empty spaces after colors to make the options screen neater, you
can ask the setting manager to remove them after or before a specific option.

```
extra.removeEmptyBefore.<Screen name> = <Option name(s)>
extra.removeEmptyAfter.<Screen name> = <Option name(s)>
```

Example: If your screen layout looked like this:

```
screen.SKY = SKY_COLOR_R SKY_COLOR_G SKY_COLOR_B <empty> SUN_COLOR_R SUN_COLOR_G SUN_COLOR_B <empty> ...
```

You can specify the empty to be removed like so:

```
extra.removeEmptyAfter.SKY = SKY_COLOR_B SUN_COLOR_B
```

The options are removed before converting them to color selectors.

### Hidden options

This is for the sake of backwards compatibility. If an option is redundant with
the extra settings, you can lock it to a constant value and hide it.

```r
extra.hidden.<Option to lock and hide> = <Value to set the option to>

# Example:
extra.hidden.COLOR_MUL = 1.0
```

For boolean options use true and false.

### Appending options into screens

This setting lets you insert settings in the middle of screens if you want
something to show up you wouldn't show on the regular optifine editor (E.g.
color selectors).

```r
extra.append.<Screen name>.<Index to append after> = <List of options to append>

# Example:
extra.append.MY_SCREEN.2 = OPTION <empty>
```

The append point is 0-indexed. If you want to append colors, they have to be
surrounded with parentheses:

```
extra.append.COLORS.2 = (SKY_COLOR)
```

### Range override

This option lets developers create user-friendly ranges (options with possible
values between two endpoints) easier. This should be considered even if you want
to keep built-in editor support, because it lets you tweak the exact behaviour
of the slider.

```perl
# Minimum value of the slider
# Required
extra.range.<Option name>.min = <Minimum value>

# Maximum value of the slider
# Required
extra.range.<Option name>.max = <Maximum value>

# Distance between allowed values, e.g. with a step of 0.1 and a min of 1 the values would be 1, 1.1, 1.2, etc.
# Optional, default: 0.0001
extra.range.<Option name>.step = <Distance>

# Mapping between slider percentage and output value.
# Optional, default: linear.
# One of: log, square_root, linear, quadratic, exponential
#    caveat: quadratic and exponential don't work with negative values
extra.range.<Option name>.growth = <Growth function type>

# Example
extra.range.SUN_BRIGHTNESS.min = 1
extra.range.SUN_BRIGTHNESS.max = 10000
extra.range.SUN_BRIGHTNESS.step = 1
extra.range.SUN_BRIGHTNESS.growth = exponential
```

Mapping is done by interpolating in the inverse range, e.g. for exponential to
interpolate between 1 and 10000 it would interpolate linearly between
`log(1) = 0` and `log(10000) ≈ 9.2103`, then running the result through the
growth function. E.g. for the same example putting the slider in the middle
would yield

If an option has an associated range declaration, but isn't in the sliders array, it will be implicitly added to it. This is only a normalization step however, don't rely on it.

```
exp((1 - 0.5) * log(1) + 0.5 * log(10000)) = exp(4.60517...) = 100
```

The requirement for inverting the growth function first is the reason the quadratic and exponential growth functions don't work for negative values.

### Dynamically disabled options

> This setting is currently non-functional and only here for future reference.

This option lets you disable or enable settings based on the value of other
boolean settings.

```r
extra.enabled.<Option to enable/disable> = <Equation using other options>

# Example:
extra.enabled.RT_STEPS = RT_TYPE == 2 && RT_ENABLED
```

The equation can use parentheses, the `&&` and `||` operators (former has higher
precedence), other boolean options and equality and inequality checks with
options (consider `OPTION == 2` and similar a single token). Options can be
negated with the `!` operator, but larger equations can't.

```r
# OK
extra.enabled.RT_STEPS = RT_TYPE == 2 && !RT_DISABLED

# Not OK
extra.enabled.RT_STEPS = !(RT_TYPE != 2 && RT_DISABLED)
# Instead use
extra.enabled.RT_STEPS = RT_TYPE == 2 || !RT_DISABLED
```

#### Language support

A new `disabled` setting can be specified for options, this will show up as a
tooltip when the user hovers over the disabled setting.

```r
# shaders/lang/en_us.lang
option.RT_STEPS.disabled = This settings needs the ray tracing type to be SSR and raytracing to be enabled.
```

### Fcrpvny

Nqqf fcrpvny syner gb gur jrofvgr.

```
rkgen.fcrpvny = <Inyhr>
```

Pbagnpg zr sbe cbffvoyr inyhrf.
