// Get DOM elements
const processButton = document.getElementById('processButton');
const volumeInput = document.getElementById('volumeInput');
const commissionInput = document.getElementById('commissionInput');
const volumeLabel = document.getElementById('fileInputLabel1');
const commissionLabel = document.getElementById('fileInputLabel2');
const reportLinksContainer = document.getElementById('reportLinksContainer');
const volumeTablesLink = document.getElementById('volumeTablesLink');
const commissionTablesLink = document.getElementById('commissionTablesLink');

let volumeReportObjectUrl = null;
let commissionReportObjectUrl = null;

const CODE_TO_COUNTRY_MAP = {
    '555W': 'Argentina',
'01H2': 'Argentina',
'6149': 'Armenia',
'01Y1': 'Armenia',
'476D': 'Austria',
'5556': 'Austria',
'0159': 'Brazil',
'540J': 'Brazil',
'626S': 'Brazil',
'01D2': 'Brazil',
'01Q1': 'Brazil',
'0146': 'Chile',
'5574': 'Chile',
'5577': 'Chile',
'622W': 'Chile',
'9732': 'Chile',
'01J2': 'Chile',
'0226': 'China',
'0960': 'China',
'406P': 'China',
'424W': 'China',
'453P': 'China',
'5004': 'China',
'625G': 'China',
'406M': 'Costa Rica',
'0116': 'Dom Rep',
'0084': 'Egypt',
'0768': 'Egypt',
'520Q': 'Egypt',
'01X1': 'Egypt',
'01D3': 'Egypt',
'0152': 'Greece',
'0319': 'Greece',
'551B': 'Greece',
'01A3': 'Greece',
'01C3': 'Greece',
'01L2': 'Greece',
'01W1': 'Greece',
'530A': 'Hong Kong',
'7287': 'Hong Kong',
'0124': 'India',
'417S': 'India',
'622Y': 'India',
'01A1': 'India',
'01C1': 'India',
'01D1': 'India',
'01U1': 'India',
'0118': 'Indonesia',
'625P': 'Italy',
'626B': 'Italy',
'5003': 'Japan',
'7292': 'Japan',
'01X2': 'Japan',
'01E3': 'Japan',
'01N1': 'Japan',
'618B': 'Malta',
'445Q': 'Mexico',
'01Q3': 'Mexico',
'486K': 'Mexico',
'0214': 'Moldova',
'1070': 'Moldova',
'01B2': 'Moldova',
'0150': 'Moroco',
'01A2': 'Morocco',
'0126': 'Netherlands',
'541Q': 'Norway',
'622N': 'Norway',
'0208': 'Peru',
'0259': 'Peru',
'416S': 'Peru',
'470G': 'Peru',
'551L': 'Peru',
'564T': 'Peru',
'01F2': 'Peru',
'01K2': 'Peru',
'0227': 'Romania',
'443W': 'Romania',
'9590': 'Romania',
'01C2': 'Romania',
'01M1': 'Romania',
'413W': 'Russia',
'0376': 'Serbia',
'0138': 'Singapore',
'6654': 'Singapore',
'01V1': 'Singapore',
'553T': 'Spain',
'625W': 'Spain',
'01S1': 'Spain',
'01R3': 'Spain',
'0115': 'Taiwan',
'0225': 'Taiwan',
'405M': 'Taiwan',
'432D': 'Taiwan',
'5020': 'Taiwan',
'550L': 'Taiwan',
'622H': 'Taiwan',
'624X': 'Taiwan',
'625E': 'Taiwan',
'626K': 'Taiwan',
'01J3': 'Taiwan',
'01T2': 'Taiwan',
'01T3': 'Taiwan',
'01K3': 'Taiwan',
'0153': 'Thailand',
'429D': 'Thailand',
'0103': 'Turkey',
'0390': 'Turkey',
'0675': 'Turkey',
'413L': 'Turkey',
'421C': 'Turkey',
'428T': 'Turkey',
'473B': 'Turkey',
'550J': 'Turkey',
'6050': 'Turkey',
'623F': 'Turkey',
'626P': 'Turkey',
'01Z3': 'Turkey',
'01F3': 'Turkey',
'01E2': 'Turkey',
'01B3': 'Turkey',
'01R1': 'Turkey',
'01R2': 'Turkey',
'01L1': 'Turkey',
'01U3': 'Turkey',
'14U1': 'U',
'622S': 'UK',
'550B': 'Uruguay',
'0123': 'Vietnam',
'505Q': 'Vietnam',
};

// Function to check if files are selected and update button state
function updateButtonState() {
    const isVolumeFileSelected = volumeInput.files.length > 0;
    const isCommissionFileSelected = commissionInput.files.length > 0;

    // Enable the button only if both files are selected
    processButton.disabled = !(isVolumeFileSelected && isCommissionFileSelected);
}

// Add change event listeners to both file inputs
volumeInput.addEventListener('change', () => {
    if (volumeInput.files.length > 0) {
        volumeLabel.textContent = volumeInput.files[0].name;
    } else {
        volumeLabel.textContent = 'Choose Volume File';
    }
    updateButtonState();
});

commissionInput.addEventListener('change', () => {
    if (commissionInput.files.length > 0) {
        commissionLabel.textContent = commissionInput.files[0].name;
    } else {
        commissionLabel.textContent = 'Choose Commission File';
    }
    updateButtonState();
});

// Add a click event listener to the process button
processButton.addEventListener('click', async () => {
    // Get the selected files
    const volumeFile = volumeInput.files[0];
    const commissionFile = commissionInput.files[0];

    // Ensure both files exist before proceeding
    if (volumeFile && commissionFile) {
        try {
            // Read the content of both files concurrently
            const [volumeFileContent, commissionFileContent] = await Promise.all([
                readFileContent(volumeFile),
                readFileContent(commissionFile)
            ]);

            // Determine the type of each file
            const volumeFileType = validateDataUpload(volumeFileContent);
            const commissionFileType = validateDataUpload(commissionFileContent);

            // Validate that the correct file type was uploaded to each input
            if (volumeFileType !== 0) {
                alert(`Error: The file '${volumeFile.name}' in the 'Volume File' section is not a valid Volume report.`);
                return; // Stop processing
            }

            if (commissionFileType !== 1) {
                alert(`Error: The file '${commissionFile.name}' in the 'Commission File' section is not a valid Commission report.`);
                return; // Stop processing
            }

            console.log("File types validated successfully. Volume and Commission reports are correct.");
            // Future processing logic will



            // Find and log the header row for each file
            const volumeHeaderRow = findHeaderRow(volumeFileContent, volumeFileType);
            const commissionHeaderRow = findHeaderRow(commissionFileContent, commissionFileType);




            console.log(`Volume header found on row: ${volumeHeaderRow}`);
            console.log(`Commission header found on row: ${commissionHeaderRow}`);



            ///////




            // Find column separators for the commission report
            const commissionSeparators = findColumnSeparators(commissionFileContent, commissionHeaderRow, commissionFileType);
            const volumeSeparators = findColumnSeparators(volumeFileContent, volumeHeaderRow, volumeFileType);

            console.log("Found Commission Column Definitions:", commissionSeparators);
            console.log("Found Volume Column Definitions:", volumeSeparators);


            // Parse the data and display it in side-by-side tables
            const { volumeTableHTML, commissionTableHTML, volumeLinkTableHTML } = parseAndDisplayReports(
                volumeFileContent,
                volumeSeparators,
                commissionFileContent,
                commissionSeparators
            );

            updateReportLinks(volumeLinkTableHTML, commissionTableHTML);

            // Enable the copy buttons now that the tables are displayed
            document.getElementById('copyButtonContainer').style.display = 'flex';
            document.getElementById('copyVolumeButton').disabled = false;
            document.getElementById('copyCommissionButton').disabled = false;












        } catch (error) {
            console.error("Error reading files:", error);
            alert("There was an error reading one of the files. Please check the console for details.");
        }
    }
});

// Add event listeners for the new copy buttons
document.getElementById('copyVolumeButton').addEventListener('click', () => {
    // The volume table is the first one in the container
    const table = document.querySelector('#reportOutput .report-table-wrapper:first-child table');
    copyTableToClipboard(table, document.getElementById('copyVolumeButton'), 'Copy Volume');
});

document.getElementById('copyCommissionButton').addEventListener('click', () => {
    // The commission table is the last one in the container
    const table = document.querySelector('#reportOutput .report-table-wrapper:last-child table');
    copyTableToClipboard(table, document.getElementById('copyCommissionButton'), 'Copy Commission');
});


/**
 * Reads the content of a File object as text.
 * @param {File} file The file to read.
 * @returns {Promise<string>} A promise that resolves with the file's content as a string.
 */
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
}

/**
 * Determines if file content is from a Volume or Commission report.
 * @param {string} content The content of the file.
 * @returns {number|null} Returns 0 for Volume, 1 for Commission, or null if type cannot be determined.
 */
function validateDataUpload(content) {
    const lines = content.split(/\r?\n/);

    if (lines.length >= 3) {
        const thirdLine = lines[2].toUpperCase();
        if (thirdLine.includes("VOLUME")) {
            return 0;
        } else if (thirdLine.includes("COMMISSION")) {
            return 1;
        }
    }
    return null;
}

/**
 * Finds the row number of the primary header line in the file content.
 * It searches for a specific "squashed" (whitespace-removed) text pattern.
 * @param {string} content The content of the file.
 * @param {number} fileType 0 for Volume, 1 for Commission.
 * @returns {number} The 1-based row number of the header, or -1 if not found.
 */
function findHeaderRow(content, fileType) {
    const lines = content.split(/\r?\n/);
    // Define the squashed header patterns to search for.
    const squashedHeaderVolume = "CLNTCURRMOLYSAMEMOCURRYTDYTDLASTYRTOTALLASTYR";
    const squashedHeaderCommission = "CLNTCURRMOLYSAMEMOCURRYTDYTDLASTYRTOTALLASTYRAVG";

    // Determine which pattern to use based on the file type.
    const targetPattern = (fileType === 0) ? squashedHeaderVolume : squashedHeaderCommission;

    for (let i = 0; i < lines.length; i++) {
        const squashedLine = lines[i].replace(/\s/g, '');
        if (squashedLine === targetPattern) {
            return i + 1; // Return the 1-based row number
        }
    }

    return -1; // Return -1 if the header row is not found
}

/**
 * Finds the indices of column separators for a given report.
 * Currently implemented for Commission reports.
 * @param {string} content The content of the file.
 * @param {number} headerRow The 1-based row number of the main header.
 * @param {number} fileType 0 for Volume, 1 for Commission.
 * @returns {object|null} An object with the column indices, or null if not found.
 */
function findColumnSeparators(content, headerRow, fileType) {
    // This logic works for both Commission (1) and Volume (0) reports.
    if (fileType === 1 || fileType === 0) {
        const lines = content.split(/\r?\n/);
        // Start searching 4 rows below the header (adjusting for 0-based index)
        const dataLineIndex = headerRow + 4 - 1;

        if (headerRow !== -1 && dataLineIndex < lines.length) {
            const dataLine = lines[dataLineIndex];

            // 2. Find a 4-character code with letters and numbers
            const codeMatch = dataLine.match(/[A-Z0-9]{4}/);
            const codeIndex = codeMatch ? codeMatch.index : -1;

            if (codeIndex === -1) {
                console.warn("Could not find 4-character code on data line:", dataLine);
                return null; // Can't define brackets without the code
            }

            // 1. The group bracket is from the start of the line to the start of the code.
            const groupBracket = { start: 0, end: codeIndex };

            // 2. The code bracket is from the start of the code to 4 characters after.
            const codeBracket = { start: codeIndex, end: codeIndex + 4 };

            // 3. The name bracket starts after the code and ends where 4 consecutive spaces are found.
            const nameStartIndex = codeBracket.end;
            const searchArea = dataLine.substring(nameStartIndex);
            const fourSpacesIndex = searchArea.indexOf("    ");

            let nameEndIndex;
            if (fourSpacesIndex !== -1) {
                // The name ends where the four spaces begin, relative to the start of the name.
                nameEndIndex = nameStartIndex + fourSpacesIndex;
            } else {
                // If no four spaces are found, assume the name goes to the end of the line.
                nameEndIndex = dataLine.length;
            }
            const nameBracket = { start: nameStartIndex, end: nameEndIndex };

            const returnObject = {
                groupBracket,
                codeBracket,
                nameBracket
            };

            // For commission reports, also find the start of the data columns from the header
            if (fileType === 1) {
                const headerLine = lines[headerRow - 1];
                const dataColumnTerms = ['CURR MO', 'LY SAME MO', 'CURR YTD', 'YTD LAST YR', 'TOTAL LAST YR', 'AVG'];
                const dataColumnIndices = {};

                dataColumnTerms.forEach(term => {
                    const index = headerLine.indexOf(term);
                    if (index !== -1) {
                        dataColumnIndices[term] = index;
                    }
                });

                const secondaryTerms = ['MTD % DIFF', 'YTD % DIFF', 'YTD DIFF'];
                [headerRow - 1, headerRow].forEach(rowIndex => {
                    const headerText = lines[rowIndex];
                    if (!headerText) {
                        return;
                    }
                    secondaryTerms.forEach(term => {
                        const idx = headerText.indexOf(term);
                        if (idx !== -1) {
                            dataColumnIndices[term] = idx;
                        }
                    });
                });

                returnObject.dataColumnIndices = dataColumnIndices;
            } else if (fileType === 0) { // Volume report
                const headerLine = lines[headerRow - 1];
                const dataColumnTerms = ['CURR MO', 'LY SAME MO', 'CURR YTD', 'YTD LAST YR', 'TOTAL LAST YR'];
                const dataColumnIndices = {};

                dataColumnTerms.forEach(term => {
                    const index = headerLine.indexOf(term);
                    if (index !== -1) {
                        dataColumnIndices[term] = index;
                    }
                });

                const secondaryTerms = ['MTD % DIFF', 'YTD % DIFF', 'YTD DIFF'];
                [headerRow - 1, headerRow].forEach(rowIndex => {
                    const headerText = lines[rowIndex];
                    if (!headerText) {
                        return;
                    }
                    secondaryTerms.forEach(term => {
                        const idx = headerText.indexOf(term);
                        if (idx !== -1) {
                            dataColumnIndices[term] = idx;
                        }
                    });
                });
                returnObject.dataColumnIndices = dataColumnIndices;
            }

            return returnObject;
        }
    }
    // Placeholder for Volume report logic or if line not found
    return null;
}

/**
 * Generates and displays two tables (Volume and Commission) side-by-side.
 * @param {string} volumeContent The full content of the volume file.
 * @param {object} volumeSeparators The separator definition object for the volume file.
 * @param {string} commissionContent The full content of the commission file.
 * @param {object} commissionSeparators The separator definition object for the commission file.
 */
function parseAndDisplayReports(volumeContent, volumeSeparators, commissionContent, commissionSeparators) {
    const outputContainer = document.getElementById('reportOutput');
    outputContainer.innerHTML = ''; // Clear previous results

    // Create and append the Volume table
    const volumeTableHTML = generateTableHTML('Volume Report', volumeContent, volumeSeparators);
    const volumeWrapper = document.createElement('div');
    volumeWrapper.className = 'report-table-wrapper';
    volumeWrapper.innerHTML = volumeTableHTML;
    outputContainer.appendChild(volumeWrapper);

    // Create and append the Commission table
    const commissionTableHTML = generateTableHTML('Commission Report', commissionContent, commissionSeparators);
    const commissionWrapper = document.createElement('div');
    commissionWrapper.className = 'report-table-wrapper';
    commissionWrapper.innerHTML = commissionTableHTML;
    outputContainer.appendChild(commissionWrapper);

    const volumeLinkTableHTML = generateVolumeLinkTable(volumeContent, volumeSeparators);

    return { volumeTableHTML, commissionTableHTML, volumeLinkTableHTML };
}

/**
 * Generates the HTML for a single report table based on its content and structure.
 * @param {string} title The title for the report table.
 * @param {string} content The full file content.
 * @param {object} separators The separator definition object.
 * @returns {string} The complete HTML string for the table.
 */
function generateTableHTML(title, content, separators) {
    if (!separators) {
        return `<h2>${title}</h2><p class="text-danger">Could not generate table because column definitions were not found.</p>`;
    }

    const lines = content.split(/\r?\n/);
    const { groupBracket, codeBracket, nameBracket, dataColumnIndices } = separators;
    // Create a sorted list of data columns to maintain order
    const sortedDataColumns = Object.entries(dataColumnIndices)
        .sort(([, indexA], [, indexB]) => indexA - indexB)
        .map(([name]) => name);

    let tableHTML = `
        <div class="excel-table-container">
            <h2>${title}</h2>
            <table class="excel-table">
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>Code</th>
                        <th>Client Name</th>
                        ${sortedDataColumns.map(name => {
        const diffClass = isDiffColumn(name) ? ' class=\"diff-header\"' : '';
        const headerContent = formatHeaderLabel(name);
        return `<th${diffClass}>${headerContent}</th>`;
    }).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    // Iterate through all lines and parse only the ones that are valid data rows.
    lines.forEach(line => {
        // A valid data row must have a single letter in the group column and a non-empty code.
        // This effectively filters out all headers, footers, page breaks, and summary lines.
        const groupValue = line.substring(groupBracket.start, groupBracket.end).trim();
        const codeValue = line.substring(codeBracket.start, codeBracket.end).trim();

        // Apply the new, more specific filter.
        if (groupValue.length !== 1 || codeValue === '') {
            return; // Skip this line
        }

        tableHTML += '<tr>';
        // Use the values we already trimmed for filtering.
        tableHTML += `<td>${groupValue}</td>`;
        tableHTML += `<td>${codeValue}</td>`;
        tableHTML += `<td>${line.substring(nameBracket.start, nameBracket.end).trim()}</td>`;

        // Extract data for each dynamic column
        sortedDataColumns.forEach(name => {
            const startIndex = dataColumnIndices[name];
            const data = line.substring(startIndex, startIndex + 15).trim();
            const diffClass = isDiffColumn(name) ? ' class=\"diff-cell\"' : '';
            tableHTML += `<td${diffClass}>${data}</td>`;
        });

        tableHTML += '</tr>';

    });

    tableHTML += '</tbody></table></div>';
    return tableHTML;
}

function generateVolumeLinkTable(content, separators) {
    if (!separators) {
        return '<p class="text-danger">Could not generate Volume table.</p>';
    }

    const lines = content.split(/\r?\n/);
    const { groupBracket, codeBracket, nameBracket, dataColumnIndices } = separators;

    const columnConfig = [
        { label: 'Client name', key: null },
        { label: 'CURR MO VOLUME', key: 'CURR MO' },
        { label: 'LY SAME MO VOLUME', key: 'LY SAME MO' },
        { label: 'MTD % DIFF', key: 'MTD % DIFF', fallbacks: ['MTD DIFF'] },
        { label: 'CURR YTD VOLUME', key: 'CURR YTD' },
        { label: 'YTD LAST YR VOLUME', key: 'YTD LAST YR' },
        { label: 'YTD % DIFF', key: 'YTD % DIFF', fallbacks: ['YTD DIFF'] },
        { label: 'TOTAL LAST YR VOLUME', key: 'TOTAL LAST YR' }
    ];

    const columnCharWidths = columnConfig.slice(1).map(() => 0);
    let clientNameCharWidth = 0;

    const groupedRows = { C: [], U: [] };

    lines.forEach(line => {
        const groupValue = line.substring(groupBracket.start, groupBracket.end).trim();
        const codeValue = line.substring(codeBracket.start, codeBracket.end).trim().toUpperCase();

        if (groupValue.length !== 1 || codeValue === '' || (!groupedRows[groupValue])) {
            return;
        }

        const nameValue = line.substring(nameBracket.start, nameBracket.end).trim();
        const country = CODE_TO_COUNTRY_MAP[codeValue] || 'Unknown Country';
        const displayName = `${nameValue}, ${country}`;

        const rowData = {};
        const rowValues = columnConfig.slice(1).map((column, index) => {
            const dataValue = extractDataColumn(line, dataColumnIndices, column.key, column.fallbacks);
            let normalizedValue = dataValue === '' ? '0' : dataValue;

            if (column.label === 'MTD % DIFF') {
                normalizedValue = computePercentageDiff(rowData['CURR MO VOLUME'], rowData['LY SAME MO VOLUME']);
            } else if (column.label === 'YTD % DIFF') {
                normalizedValue = computePercentageDiff(rowData['CURR YTD VOLUME'], rowData['YTD LAST YR VOLUME']);
            }

            rowData[column.label] = normalizedValue;
            columnCharWidths[index] = Math.max(columnCharWidths[index], normalizedValue.length);
            return normalizedValue;
        });

        const hasNonZeroValue = rowValues.some(value => !isZeroValue(value));
        if (!hasNonZeroValue) {
            return;
        }

        clientNameCharWidth = Math.max(clientNameCharWidth, displayName.length);
        groupedRows[groupValue].push({ displayName, rowValues });
    });

    const groupDefinitions = [
        { key: 'C', heading: 'Group C - CIT Table' },
        { key: 'U', heading: 'Group U - FCB Table' }
    ];

    const tablesHTML = groupDefinitions.map(({ key, heading }) => {
        const rows = groupedRows[key];
        const clientColWidth = Math.min(Math.max((clientNameCharWidth || 12) + 2, 14), 24);
        const headerRow = columnConfig.map((column, index) => {
            if (index === 0) {
                return `<th class="heading-cell heading-client" style="width:${clientColWidth}ch">${formatHeaderLabel(column.label)}</th>`;
            }
            const headerMinWidth = getHeaderPrefixLength(column.label) + 1;
            const width = Math.min(Math.max((columnCharWidths[index - 1] || 1) + 4, headerMinWidth, 12), 24);
            const labelHtml = formatHeaderLabel(column.label);
            const extraHeaderClass = isDiffColumn(column.label) ? ' diff-header' : '';
            return `<th class="heading-cell${extraHeaderClass}" style="width:${width}ch">${labelHtml}</th>`;
        }).join('');
        const bodyRows = rows.map(row => {
            const cells = row.rowValues.map((value, valueIndex) => {
                const columnLabel = columnConfig[valueIndex + 1].label;
                const isDiff = isDiffColumn(columnLabel);
                const cellClass = isDiff ? 'numeric-cell diff-cell' : 'numeric-cell';
                return `<td class='${cellClass}'>${value}</td>`;
            }).join('');
            return `<tr><td>${row.displayName}</td>${cells}</tr>`;
        }).join('');
        const bodyContent = bodyRows || `<tr><td colspan="${columnConfig.length}">No data available</td></tr>`;
        const totals = columnConfig.slice(1).map((column, valueIndex) => {
            if (isDiffColumn(column.label) || rows.length === 0) {
                return '';
            }
            let sum = 0;
            let hasValue = false;
            rows.forEach(row => {
                const numericValue = parseNumericValue(row.rowValues[valueIndex]);
                if (numericValue !== null) {
                    sum += numericValue;
                    hasValue = true;
                }
            });
            return hasValue ? formatTotalValue(sum) : '';
        });
        const footerRow = rows.length > 0
            ? `<tfoot><tr class="total-row"><th class="heading-cell heading-client">TOTAL</th>${totals.map((value, index) => {
                const columnLabel = columnConfig[index + 1].label;
                const isDiff = isDiffColumn(columnLabel);
                const headerClasses = ['heading-cell'];
                if (isDiff) {
                    headerClasses.push('diff-header');
                }
                const classAttr = headerClasses.join(' ');
                const cellValue = isDiff ? '' : value;
                return `<th class="${classAttr}">${cellValue}</th>`;
            }).join('')}</tr></tfoot>`
            : '';

        return `
            <div class="excel-table-container">
                <h2>${heading}</h2>
                <div class="table-scroll">
                    <table class="excel-table">
                        <colgroup>
                            <col style="width:${clientColWidth}ch">
                            ${columnCharWidths.map((length, colIndex) => {
            const headerMinWidth = getHeaderPrefixLength(columnConfig[colIndex + 1].label) + 1;
            const width = Math.min(Math.max((length || 1) + 4, headerMinWidth, 12), 24);
            return `<col style="width:${width}ch">`;
        }).join('')}
                        </colgroup>
                        <thead>
                            <tr>${headerRow}</tr>
                        </thead>
                        <tbody>
                            ${bodyContent}
                        </tbody>
                        ${footerRow}
                    </table>
                </div>
            </div>
        `;
    }).join('');

    return `<div class="volume-group-tables">${tablesHTML}</div>`;
}

function extractDataColumn(line, indices, primaryKey, fallbackKeys = []) {
    if (!primaryKey) {
        return '';
    }

    const keysToTry = [primaryKey, ...fallbackKeys];
    const columnStart = keysToTry.reduce((found, key) => {
        if (found !== null) {
            return found;
        }
        if (key && Object.prototype.hasOwnProperty.call(indices, key)) {
            return indices[key];
        }
        return null;
    }, null);

    if (columnStart === null || columnStart === undefined) {
        return '';
    }

    return line.substring(columnStart, columnStart + 15).trim();
}

function isZeroValue(value) {
    if (typeof value !== 'string') {
        return false;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
        return true;
    }

    const numericCandidate = trimmed.replace(/[^0-9.\-]/g, '');
    if (numericCandidate === '' || numericCandidate === '-' || numericCandidate === '.') {
        return true;
    }

    const numericValue = parseFloat(numericCandidate);
    if (Number.isNaN(numericValue)) {
        return trimmed === '0';
    }

    return numericValue === 0;
}

function parseNumericValue(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value ? value.trim() : '';
    if (trimmed === '') {
        return null;
    }

    const normalized = trimmed.replace(/,/g, '');
    const numericValue = Number(normalized);
    return Number.isNaN(numericValue) ? null : numericValue;
}

function formatTotalValue(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return '';
    }

    if (Number.isInteger(value)) {
        return value.toLocaleString('en-US');
    }

    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function computePercentageDiff(currentValue, previousValue) {
    const currentNumber = parseNumericValue(currentValue);
    const previousNumber = parseNumericValue(previousValue);

    if (
        currentNumber === null ||
        previousNumber === null ||
        currentNumber === 0 ||
        previousNumber === 0
    ) {
        return 'N/A';
    }

    const percentValue = ((currentNumber - previousNumber) / previousNumber) * 100;
    const roundedPercent = Math.round(percentValue);
    return `${roundedPercent}%`;
}

function formatHeaderLabel(label) {
    if (label === 'Client name') {
        return label;
    }

    if (label.includes(' VOLUME')) {
        const prefix = label.split(' VOLUME')[0].trim();
        return `${prefix}<br>VOLUME`;
    }

    if (label.includes('% DIFF')) {
        return label.replace(' % ', ' %<br>');
    }

    return label.replace(/\s+/g, '<br>');
}

function getHeaderPrefixLength(label) {
    if (label.includes(' VOLUME')) {
        return label.split(' VOLUME')[0].trim().length;
    }

    if (label.includes('% DIFF')) {
        const [prefix] = label.split(' % DIFF');
        return `${prefix.trim()} %`.length;
    }

    return label.length;
}

function isDiffColumn(label) {
    return label.includes('% DIFF');
}

/**
 * Copies the content of an HTML table to the clipboard in TSV format.
 * @param {HTMLTableElement} table The table element to copy.
 * @param {HTMLButtonElement} buttonElement The button that was clicked.
 * @param {string} originalButtonText The original text of the button.
 */
function copyTableToClipboard(table, buttonElement, originalButtonText) {
    if (!table) {
        alert('Could not find the table to copy.');
        return;
    }

    let tsv = '';
    // Iterate over all rows in the table (including the header)
    for (const row of table.rows) {
        const rowData = Array.from(row.cells).map(cell => cell.innerText.replace(/\t/g, ' '));
        tsv += rowData.join('\t') + '\n';
    }

    navigator.clipboard.writeText(tsv).then(() => {
        buttonElement.textContent = 'Copied!';
        setTimeout(() => {
            buttonElement.textContent = originalButtonText;
        }, 2000);
    }).catch(err => console.error('Failed to copy table: ', err));
}



// Add event listeners for the new copy buttons
document.getElementById('copyVolumeButton').addEventListener('click', () => {
    // The volume table is the first one in the container
    const table = document.querySelector('#reportOutput .report-table-wrapper:first-child table');
    copyTableToClipboard(table, document.getElementById('copyVolumeButton'), 'Copy Volume');
});

document.getElementById('copyCommissionButton').addEventListener('click', () => {
    // The commission table is the last one in the container
    const table = document.querySelector('#reportOutput .report-table-wrapper:last-child table');
    copyTableToClipboard(table, document.getElementById('copyCommissionButton'), 'Copy Commission');
});

function updateReportLinks(volumeLinkTableHTML, commissionTableHTML) {
    if (!reportLinksContainer || !volumeTablesLink || !commissionTablesLink) {
        return;
    }

    if (volumeReportObjectUrl) {
        URL.revokeObjectURL(volumeReportObjectUrl);
    }
    if (commissionReportObjectUrl) {
        URL.revokeObjectURL(commissionReportObjectUrl);
    }

    volumeReportObjectUrl = createReportObjectUrl('Volume Report Tables', volumeLinkTableHTML);
    commissionReportObjectUrl = createReportObjectUrl('Commission Report Tables', commissionTableHTML);

    volumeTablesLink.href = volumeReportObjectUrl;
    commissionTablesLink.href = commissionReportObjectUrl;

    reportLinksContainer.style.display = 'flex';
}

function createReportObjectUrl(pageTitle, tableMarkup) {
    const standaloneHtml = buildStandaloneReportHtml(pageTitle, tableMarkup);
    const blob = new Blob([standaloneHtml], { type: 'text/html' });
    return URL.createObjectURL(blob);
}

function buildStandaloneReportHtml(pageTitle, tableMarkup) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>${pageTitle}</title>
    <style>
        body { font-family: 'Open Sans', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; color: #000000; }
        main { max-width: 1200px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        h1 { color: #006DBA; text-align: center; margin-bottom: 18px; font-size: 1.8rem; }
        .volume-group-tables { display: flex; flex-direction: column; gap: 24px; }
        .excel-table-container { width: 100%; border: 1px solid #D0D0D0; border-radius: 6px; padding: 16px; background: #fff; box-sizing: border-box; }
        .excel-table-container h2 { font-size: 1.25rem; margin: 0 0 12px 0; color: #00224F; text-align: center; }
        .excel-table-container .table-scroll { overflow-x: auto; }
        .excel-table { width: 100%; border-collapse: collapse; background-color: #fff; table-layout: auto; }
        .excel-table th, .excel-table td { border: 1px solid #000000; padding: 6px 7px; text-align: left; font-size: 0.75rem; white-space: normal; word-break: break-word; font-family: 'Courier New', Courier, monospace; color: #000000; }
        .excel-table th { background-color: #83cceb; color: #1d3461; position: sticky; top: 0; font-size: 0.78rem; }
        .excel-table th.heading-cell { text-align: center; }
        .excel-table th.diff-header { background-color: #f1a983; color: #1d3461; }
        .excel-table td.diff-cell { background-color: #f7c7ac; }
        .excel-table th.heading-client { text-align: left; }
        .excel-table td.numeric-cell { text-align: right; }
        .excel-table tr:nth-child(even) { background-color: #F5F5F5; }
        .excel-table tr:hover { background-color: #E8F2FB; }
        @media (max-width: 1100px) {
            .excel-table-container { min-width: 100%; }
        }
        @media (max-width: 800px) {
            body { padding: 10px; }
            main { padding: 16px; }
            .excel-table th, .excel-table td { font-size: 0.68rem; padding: 4px; }
        }
        @media print { body { background: #fff; padding: 0; } main { box-shadow: none; } }
    </style>
</head>
<body>
    <main>
        <h1>${pageTitle}</h1>
        ${tableMarkup}
    </main>
</body>
</html>`;
}

window.addEventListener('beforeunload', () => {
    if (volumeReportObjectUrl) {
        URL.revokeObjectURL(volumeReportObjectUrl);
    }
    if (commissionReportObjectUrl) {
        URL.revokeObjectURL(commissionReportObjectUrl);
    }
});