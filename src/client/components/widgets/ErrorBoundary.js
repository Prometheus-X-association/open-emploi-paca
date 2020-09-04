import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    console.error(error);
    console.error(errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <span>💥🤬🙉🙈</span>;
    }
    return this.props.children;
  }
}
