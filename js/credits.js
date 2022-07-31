export const logCredits = () => {
    const pieceEmoji = String.fromCodePoint(0x1f603);

    const logStyle = [
        "color: #00ffff",
        "font-size: 3em",
        "font-weight: 200",
        "padding: 50px 50px 50px 50px",
        "background-color: rgba(0, 0, 0, 0.1"
    ].join(";");

    return console.log(
        `%c © ${new Date().getFullYear()} github.com/PrinceAFelix ${pieceEmoji}`,
        logStyle
    );
};
