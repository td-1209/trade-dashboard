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
    blackActive: '#000000'
  }
};

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
        PrimaryButtonBG: palette.dark.primary,
        PrimaryButtonBGActive: palette.dark.primaryActive,
        PrimaryButtonText: palette.dark.white,
        SecondaryButtonBG: palette.dark.secondary,
        SecondaryButtonBGActive: palette.dark.secondaryActive,
        SecondaryButtonText: palette.dark.white,
        AttentionButtonBG: palette.dark.attention,
        AttentionButtonBGActive: palette.dark.attentionActive,
        AttentionButtonText: palette.dark.white,
        NormalButtonBG: palette.dark.white,
        NormalButtonBGActive: palette.dark.whiteActive,
        NormalButtonText: palette.dark.black,
        CancelButtonBG: palette.dark.darkGray,
        CancelButtonBGActive: palette.dark.darkGrayActive,
        CancelButtonText: palette.dark.white,
      },
    },
  },
  plugins: [],
};
export default config;