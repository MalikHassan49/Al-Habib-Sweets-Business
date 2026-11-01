import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-3xl">Something went wrong</h1>
        <p className="mt-2 text-choc/80">Please reload the page. If it keeps happening, contact the shop.</p>
        <button className="btn-primary mt-6" onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}
