import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    // Catch errors in any components below and re-render with error message
    this.setState({ error, info });
    // Also log to console
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{padding:20,fontFamily:'system-ui,Segoe UI,Roboto',color:'#111'}}>
          <h2 style={{color:'#b91c1c'}}>Something went wrong</h2>
          <pre style={{whiteSpace:'pre-wrap',background:'#fff6f6',padding:12,borderRadius:6,overflowX:'auto'}}>
{String(this.state.error && this.state.error.toString())}
{this.state.info && this.state.info.componentStack}
          </pre>
          <p>Open DevTools console for more details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
