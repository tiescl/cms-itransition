export default function StatusWrapper({ status, accentColor }) {
    const styling = {
        border: '2px solid',
        borderColor: accentColor,
        borderRadius: '7px',
        color: accentColor,
        padding: '2px 5px',
    }
    return(
        <span style={styling}>{status}</span>
    );
}