import {type  Config } from 'tailwindcss';
 
export const palette = {
  dark: {
    primary: '#B39DDB',
    primaryTrans: '#B39DDBF7',
    primaryActive: '#9575CD',
    secondary: '#448AFF',
    secondaryTrans: '#448AFFF7',
    secondaryActive: '#2979FF',
    attention: '#F50057',
    attentionTrans: '#F50057F7',
    attentionActive: '#C51162',
    white: '#ECEFF1',
    whiteTrans: '#ECEFF1F7',
    whiteActive: '#CFD8DC',
    lightGray: '#757575',
    lightGrayTrans: '#757575F7',
    lightGrayActive: '#616161',
    darkGray: '#333333',
    darkGrayTrans: '#333333F7',
    darkGrayActive: '#222222',
    black: '#212121',
    blackTrans: '#212121F7',
    blackActive: '#000000',
    positive: '#5BAD92',
    negative: '#EA0032'
  }
};

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: palette.dark.primary,
        primaryTrans: palette.dark.primaryTrans,
        primaryActive: palette.dark.primaryActive,
        secondary: palette.dark.secondary,
        secondaryTrans: palette.dark.secondaryTrans,
        secondaryActive: palette.dark.secondaryActive,
        attention: palette.dark.attention,
        attentionTrans: palette.dark.attentionTrans,
        attentionActive: palette.dark.attentionActive,
        white: palette.dark.white,
        whiteTrans: palette.dark.whiteTrans,
        whiteActive: palette.dark.whiteActive,
        lightGray: palette.dark.lightGray,
        lightGrayTrans: palette.dark.lightGrayTrans,
        lightGrayActive: palette.dark.lightGrayActive,
        darkGray: palette.dark.darkGray,
        darkGrayTrans: palette.dark.darkGrayTrans,
        darkGrayActive: palette.dark.darkGrayActive,
        black: palette.dark.black,
        blackTrans: palette.dark.blackTrans,
        blackActive: palette.dark.blackActive,
        positive: palette.dark.positive,
        negative: palette.dark.negative,
        headerBG: palette.dark.black,
        appTitle: palette.dark.white,
        bodyBG: palette.dark.black,
        bodyText: palette.dark.white,
        resultTitleText: palette.dark.white,
        resultContentText: palette.dark.white,
        contentBG: palette.dark.darkGrayActive,
        contentBGTrans: palette.dark.darkGrayTrans,
        contentText: palette.dark.white,
        contentTextTrans: palette.dark.lightGray,
        tagBG: palette.dark.darkGray,
        tagBGActive: palette.dark.darkGrayActive,
        tagText: palette.dark.white,
        tagRemoveText: palette.dark.secondary,
        fullScreenModalBG: palette.dark.blackTrans,
        windowedScreenModalBG: palette.dark.black,
        modalText: palette.dark.lightGray,
        link: palette.dark.secondary,
        icon: palette.dark.white,
        primaryButtonBG: palette.dark.primary,
        primaryButtonBGActive: palette.dark.primaryActive,
        primaryButtonText: palette.dark.white,
        secondaryButtonBG: palette.dark.secondary,
        secondaryButtonBGActive: palette.dark.secondaryActive,
        secondaryButtonText: palette.dark.white,
        attentionButtonBG: palette.dark.attention,
        attentionButtonBGActive: palette.dark.attentionActive,
        attentionButtonText: palette.dark.white,
        normalButtonBG: palette.dark.white,
        normalButtonBGActive: palette.dark.whiteActive,
        normalButtonText: palette.dark.black,
        normalButtonBGTrans: palette.dark.blackTrans,
        cancelButtonBG: palette.dark.darkGray,
        cancelButtonBGActive: palette.dark.darkGrayActive,
        cancelButtonText: palette.dark.white,
        cancelButtonBGTrans: palette.dark.darkGrayTrans,
      },
    },
  },
  plugins: [],
};
export default config;