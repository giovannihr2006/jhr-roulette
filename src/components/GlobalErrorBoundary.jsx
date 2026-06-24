import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("FATAL ERROR CAUGHT BY BOUNDARY:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: '#111', color: '#ff4444',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', textAlign: 'center', zIndex: 999999
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>⚠️ ERROR CRÍTICO DETECTADO</h1>
                    <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>
                        La aplicación ha sufrido un error inesperado.
                    </p>
                    <div style={{
                        background: '#000', padding: '15px', borderRadius: '8px',
                        fontFamily: 'monospace', textAlign: 'left', maxWidth: '800px',
                        overflow: 'auto', border: '1px solid #444', marginBottom: '20px'
                    }}>
                        <strong>{this.state.error && this.state.error.toString()}</strong>
                        <pre style={{ fontSize: '0.8rem', color: '#aaa' }}>
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('baryonic-financial-store');
                            localStorage.removeItem('casinoLayout_v5');
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{
                            background: '#ff4444', color: 'white', border: 'none',
                            padding: '15px 30px', fontSize: '1rem', fontWeight: 'bold',
                            borderRadius: '50px', cursor: 'pointer'
                        }}
                    >
                        BORRAR DATOS Y REINICIAR (RESCATE)
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            background: 'transparent', color: '#888', border: '1px solid #555',
                            padding: '10px 20px', fontSize: '0.9rem', fontWeight: 'bold',
                            borderRadius: '50px', cursor: 'pointer'
                        }}
                    >
                        Solo Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
