export type ThemeID = 'claude' | 'cursor' | 'warp';

export interface Theme {
  id: ThemeID;
  name: string;
  description: string;
  designer: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  semantic: {
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  components: {
    chat: {
      userBubble: string;
      aiBubble: string;
      inputBg: string;
    };
    editor: {
      bg: string;
      gutter: string;
      lineHighlight: string;
    };
    fileTree: {
      bg: string;
      selectedItem: string;
      hover: string;
    };
  };
}

export interface ThemeTypography {
  families: {
    display: string;
    ui: string;
    body: string;
    code: string;
  };
  sizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface ThemeSpacing {
  unit: number;
  scale: number[];
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  focus: string;
}

export interface ThemeBorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}
