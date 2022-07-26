const { rem } = require('../utils')

const colors = require('../base/colors')
const { baseTypography: typography } = require('../base/typography')
const themes = {
  solid: {
    backgroundColor: colors.black.DEFAULT,
    color: colors.white,

    '&:hover, &.hover': {
      backgroundColor: colors.green[300],
      borderColor: colors.green[300],
      color: colors.white
    },

    '&:disabled, &.disabled': {
      backgroundColor: colors.gray.DEFAULT,
      borderColor: colors.gray.DEFAULT
    }
  },
  outline: {
    color: colors.gray.DEFAULT,
    borderColor: colors.gray.DEFAULT,

    '&:hover, &.hover': {
      borderColor: colors.gray[500],
      color: colors.gray[500]
    },

    '&:disabled, &.disabled': {
      borderColor: colors.black[100],
      color: colors.black[200]
    }
  },
  error: {
    backgroundColor: colors.red.DEFAULT,
    borderColor: colors.red.DEFAULT,
    color: colors.white,

    '&:hover, &.hover': {
      backgroundColor: 'transparent',
      color: colors.red.DEFAULT
    },

    '&:disabled, &.disabled': {
      backgroundColor: colors.gray.DEFAULT,
      borderColor: colors.gray.DEFAULT
    }
  },
  success: {
    backgroundColor: colors.green.DEFAULT,
    borderColor: colors.green.DEFAULT,
    color: colors.white,

    '&:hover, &.hover': {
      backgroundColor: colors.green[300],
      borderColor: colors.green[300],
      color: colors.white
    },

    '&:disabled, &.disabled': {
      backgroundColor: colors.gray.DEFAULT,
      borderColor: colors.gray.DEFAULT
    }
  },
  'outline-success': {
    borderColor: colors.green.DEFAULT,
    color: colors.white,

    '&:hover, &.hover': {
      borderColor: colors.green.DEFAULT,
      backgroundColor: colors.green.DEFAULT
    },

    '&:disabled, &.disabled': {
      borderColor: colors.gray.DEFAULT
    }
  },
  small: {
    padding: `${rem(8)} ${rem(20)} ${rem(8)} ${rem(20)}`
  },
  extraSmall: {
    padding: `${rem(5)} ${rem(10)} ${rem(5)} ${rem(10)}`,
    fontSize: '12px'
  }
}

const themeButtonStyles = () => {
  const styles = {}

  for (const theme in themes) {
    if (themes.hasOwnProperty(theme)) {
      styles[theme] = themes[theme]
    }
  }

  return styles
}

const buttonsStyles = ({ theme }) => ({
  base: {
    lineHeight: 1.2,
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    justifyContent: 'center',
    position: 'relative',
    fontWeight: theme('fontWeight.normal'),
    transitionProperty: theme('transitionProperty.default'),
    transitionTimingFunction: theme("transitionTimingFunction['in-out']"),
    transitionDuration: theme('transitionDuration.200'),
    padding: `${rem(12)} ${rem(25)} ${rem(13)} ${rem(25)}`,
    fontSize: typography.text.base,
    appearance: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.black.DEFAULT,
    borderRadius: rem(4),
    color: colors.white,

    '&:disabled, &.disabled': {
      color: colors.black[200],
      pointerEvents: 'none'
    },

    '&:focus': {
      outline: 'none'
    },

    '.button__icon': {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: rem(8)
    }
  },
  ...themeButtonStyles()
})

const buttons = ({ theme }) => {
  const button = buttonsStyles({ theme })
  return {
    '.button': button.base,
    '.button--solid': button.solid,
    '.button--outline': button.outline,
    '.button--error': button.error,
    '.button--success': button.success,
    '.button--outline-success': button['outline-success'],
    '.button--small': button.small,
    '.button--extraSmall': button.extraSmall
  }
}

module.exports = { buttons, buttonsStyles }
