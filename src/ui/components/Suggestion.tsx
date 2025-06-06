import * as React from 'react';
import { Position, Range, WorkspaceEdit, window, workspace } from 'vscode';

interface SuggestionProps {
    message: string;
    line: number;
    fixFrom: string;
    fixTo: string;
    onFix: () => void;
}

export const Suggestion: React.FC<SuggestionProps> = ({ message, line, fixFrom, fixTo, onFix }) => {
    return (
        <div className="suggestion-item">
            <div className="suggestion-header">
                <span className="message">{message}</span>
                <span className="line-number">(Line {line})</span>
            </div>
            <div className="suggestion-details">
                <div className="current-code">{fixFrom}</div>
                <div className="fix-code">{fixTo}</div>
            </div>
            <button className="fix-button" onClick={onFix}>Fix</button>
        </div>
    );
};

export const SuggestionPanel: React.FC = () => {
    const [suggestions, setSuggestions] = React.useState<SuggestionProps[]>([]);

    const handleFix = async (line: number, fixTo: string) => {
        const editor = window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const lineText = document.lineAt(line - 1).text;
        
        const edit = new WorkspaceEdit();
        const position = new Position(line - 1, 0);
        const range = new Range(position, position.with(position.line, lineText.length));
        edit.replace(document.uri, range, fixTo);
        
        const success = await workspace.applyEdit(edit);
        if (success) {
            setSuggestions(prev => prev.filter(s => s.line !== line));
            window.showInformationMessage('Fixed the suggestion!');
        }
    };

    return (
        <div className="suggestion-panel">
            {suggestions.map((suggestion, index) => (
                <Suggestion
                    key={index}
                    {...suggestion}
                    onFix={() => handleFix(suggestion.line, suggestion.fixTo)}
                />
            ))}
        </div>
    );
};
