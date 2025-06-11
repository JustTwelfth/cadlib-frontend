declare global {
  namespace JSX {
    interface IntrinsicElements {
      'bim-viewport': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'bim-grid': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        layouts?: any;
        layout?: string;
      }, HTMLElement>;
      'bim-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'bim-panel-section': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'bim-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'bim-text-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}