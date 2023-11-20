# Extra shader options

## Developer usage

Configuration is mostly done through the `shaders.properties` file, every extra setting lives under the `extra` namespace. Currently you can define the following:

### Colors

This option lets you wrap three RGB sliders into a single color selector. The sliders for the green and blue components will be removed from every screen they are part of and the red slider will be replaced by the color selector. The selector assumes a range of [0, 1] on all three sliders.

```
extra.colors.<New option name> = <Red option name> <Green option name> <Blue option name>

# Example:
extra.colors.SKY_COLOR = SKY_COLOR_R SKY_COLOR_G SKY_COLOR_B
```

#### Language support

```
# shaders/lang/en_us.lang
option.SKY_COLOR = Sky color
option.SKY_COLOR.comment = The color of the sky.
```

`value`-s are not supported.

### Removing empty spaces

If you added empty spaces after colors to make the options screen neater, you can ask the setting manager to remove them after or before a specific option.

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

This is for the sake of backwards compatibility. If an option is redundant with the extra settings, you can lock it to a constant value and hide it.

```
extra.hidden.<Option to lock and hide> = <Value to set the option to>

# Example:
extra.hidden.COLOR_MUL = 1.0
```

For boolean options use true and false.

### Dynamically disabled options

> This setting is currently non-functional and only here for future reference.

This option lets you disable or enable settings based on the value of other boolean settings.

```
extra.enabled.<Option to enable/disable> = <Equation using other options>

# Example:
extra.enabled.RT_STEPS = RT_TYPE == 2 && RT_ENABLED
```

The equation can use parentheses, the `&&` and `||` operators (former has higher precedence), other boolean options and equality and inequality checks with options (consider `OPTION == 2` and similar a single token). Options can be negated with the `!` operator, but larger equations can't.

```
# OK
extra.enabled.RT_STEPS = RT_TYPE == 2 && !RT_DISABLED

# Not OK
extra.enabled.RT_STEPS = !(RT_TYPE != 2 && RT_DISABLED)
# Instead use
extra.enabled.RT_STEPS = RT_TYPE == 2 || !RT_DISABLED
```

#### Language support

A new `disabled` setting can be specified for options, this will show up as a tooltip when the user hovers over the disabled setting.

```
# shaders/lang/en_us.lang
option.RT_STEPS.disabled = This settings needs the ray tracing type to be SSR and raytracing to be enabled.
```

### Fcrpvny

Nqqf fcrpvny syner gb gur jrofvgr.

```
rkgen.fcrpvny = <Inyhr>
```

Pbagnpg zr sbe cbffvoyr inyhrf.
