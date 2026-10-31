import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error, info) {
    console.error(`[section] ${this.props.name} offline`, error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <section id={this.props.id} className="section-offline" aria-label={this.props.name}>
          <h2>{this.props.name}</h2>
          <p role="status">SECTION OFFLINE</p>
          <a href="#contact">Get in touch</a>
        </section>
      );
    }
    return this.props.children;
  }
}
