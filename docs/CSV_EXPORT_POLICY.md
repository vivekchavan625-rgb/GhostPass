# CSV Export Formula-Injection Neutralization Policy

GhostPass implements a strict client-side formula neutralization defense for all CSV exports.

## Neutralization Rules
When exporting sanitized CSV files to disk:
1. **Target Characters**: Any string cell whose first character is `=`, `+`, `-`, or `@`, or control whitespace `\t` (Tab) or `\r` (Carriage Return).
2. **Exemption**: Plain numeric values (e.g., `-42`, `-42.5`, `+12.00`) are valid mathematical numbers and are **exempt** from modification.
   - Note: Country code phone numbers (e.g. `+91 98201 12345`) or mixed alpha-numeric strings starting with `+` or `-` are **NOT** plain numbers and will be neutralized.
3. **Escaping Mechanism**: Prepends a leading single quote (`'`) to the cell contents. Spreadsheets (Excel, Google Sheets, LibreOffice Calc) interpret the leading single quote as a text marker, rendering the text cleanly without executing formulas (DDE, macro execution, or external hyperlink exfiltration).
4. **Audit Reporting**: The user interface visibly displays a notice informing the user of the exact count of cells neutralized during CSV export.
