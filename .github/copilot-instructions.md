# ICS Advisory Project

The ICS Advisory Project is a data repository that provides clean and usable DHS CISA ICS Advisories data in CSV format. This is NOT a traditional software project - there is no code to build, compile, or run. The repository contains structured vulnerability data for OT/ICS environments.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Repository Setup and Validation
- Clone the repository - no additional setup required:
  ```bash
  # Repository is ready to use immediately after clone
  cd /path/to/ICS-Advisory-Project
  ```

- Validate CSV data integrity (takes <0.05 seconds):
  ```bash
  python3 -c "
  import csv
  import sys
  try:
      with open('ICS-CERT_ADV/CISA_ICS_ADV_Master.csv', 'r', encoding='utf-8') as f:
          reader = csv.DictReader(f)
          count = sum(1 for row in reader)
          print(f'CSV validation successful: {count} data rows')
  except Exception as e:
      print(f'CSV validation failed: {e}')
      sys.exit(1)
  "
  ```

- Check data file counts and sizes:
  ```bash
  find ICS-CERT_ADV/ -name "*.csv" | wc -l  # Should show 211 CSV files
  du -sh ICS-CERT_ADV/                      # Shows ~265MB total
  ```

### Data Structure and Files
- **Main data directory**: `ICS-CERT_ADV/` contains all CSV files
- **Master file**: `CISA_ICS_ADV_Master.csv` (3,430+ rows) - primary dataset
- **Year-specific files**: Files named by year (2010-2025) with date stamps
- **Archive**: `ICS-CERT_ADV_Archive/` contains historical versions

### CSV Data Validation
- Always use Python's csv module for parsing (handles embedded commas correctly):
  ```bash
  python3 -c "
  import csv
  with open('ICS-CERT_ADV/CISA_ICS_ADV_Master.csv', 'r', encoding='utf-8') as f:
      reader = csv.DictReader(f)
      for i, row in enumerate(reader):
          if i < 5:  # Show first 5 rows
              print(f'Row {i+1}: {row[\"ICS-CERT_Number\"]} - {row[\"Vendor\"]}')
          else:
              break
  "
  ```

- Check CSV column structure (17 expected columns):
  ```bash
  head -1 ICS-CERT_ADV/CISA_ICS_ADV_Master.csv | tr ',' '\n' | nl
  ```

- Validate file encoding and basic structure:
  ```bash
  file ICS-CERT_ADV/*.csv | head -5  # Should show UTF-8 encoded CSV files
  ```

## Validation Scenarios

Since this is a data repository, validation focuses on data integrity rather than application functionality:

### Complete Data Integrity Check
Run this comprehensive validation after making any changes to CSV files:
```bash
cd ICS-CERT_ADV/
for file in *.csv; do
    echo "Validating $file..."
    python3 -c "
import csv
import sys
try:
    with open('$file', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        print(f'  ✓ {len(rows)} rows parsed successfully')
        if len(rows) > 0 and 'CVE_Number' in rows[0]:
            cve_count = sum(1 for row in rows if row.get('CVE_Number', '').strip())
            print(f'  ✓ {cve_count} rows contain CVE data')
        else:
            print(f'  ⚠ No CVE_Number column found or no data')
except Exception as e:
    print(f'  ✗ Validation failed: {e}')
    sys.exit(1)
"
done
echo "Data validation complete"
```

### Quick Data Sample Check
Verify recent data is present and properly formatted:
```bash
python3 -c "
import csv
from datetime import datetime
with open('ICS-CERT_ADV/CISA_ICS_ADV_Master.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    recent_count = 0
    current_year = datetime.now().year
    for row in reader:
        if row.get('Year') == str(current_year):
            recent_count += 1
    print(f'Found {recent_count} advisories for {current_year}')
"
```

## Common Tasks

### Data Analysis Examples
- Count advisories by year:
  ```bash
  python3 -c "
  import csv
  from collections import Counter
  with open('ICS-CERT_ADV/CISA_ICS_ADV_Master.csv', 'r', encoding='utf-8') as f:
      reader = csv.DictReader(f)
      years = [row['Year'] for row in reader if row.get('Year')]
      year_counts = Counter(years)
      for year, count in sorted(year_counts.items()):
          print(f'{year}: {count} advisories')
  "
  ```

- Find advisories by vendor (example with Siemens):
  ```bash
  python3 -c "
  import csv
  vendor = 'Siemens'  # Replace with desired vendor name
  with open('ICS-CERT_ADV/CISA_ICS_ADV_Master.csv', 'r', encoding='utf-8') as f:
      reader = csv.DictReader(f)
      matches = [row for row in reader if vendor.lower() in row.get('Vendor', '').lower()]
      print(f'Found {len(matches)} advisories for vendor containing \"{vendor}\"')
      for match in matches[:5]:  # Show first 5
          print(f'  {match[\"ICS-CERT_Number\"]}: {match[\"ICS-CERT_Advisory_Title\"]}')
  "
  ```

### Repository Information
Quick reference information to save time:

#### Repository Structure
```
ICS-Advisory-Project/
├── README.md              # Project overview and links
├── SECURITY.md           # Security policy and contact info  
├── LICENSE.md            # Open Database License (ODbL) v1.0
├── Issues.md             # How to report issues
└── ICS-CERT_ADV/         # Main data directory (265MB)
    ├── CISA_ICS_ADV_Master.csv              # Primary dataset (3,430+ rows)
    ├── CISA_ICS_ADV_[YEAR]_[DATE].csv      # Year-specific files
    ├── ICS-CERT_ADV_[YEAR]_[DATE].csv      # Legacy naming format
    └── ICS-CERT_ADV_Archive/                # Historical versions
        └── [archived files...]
```

#### CSV Column Structure (17 columns)
1. icsad_ID
2. Original_Release_Date  
3. Last_Updated
4. Year
5. ICS-CERT_Number
6. ICS-CERT_Advisory_Title
7. Vendor
8. Product
9. Products_Affected
10. CVE_Number
11. Cumulative_CVSS
12. CVSS_Severity
13. CWE_Number
14. Critical_Infrastructure_Sector
15. Product_Distribution
16. Company_Headquarters
17. License

## Critical Reminders

- **NO BUILD SYSTEM**: This repository contains only CSV data files. There is nothing to compile, build, or run.
- **DATA FOCUS**: All validation and testing centers around CSV data integrity and format correctness.
- **ENCODING**: Files are UTF-8 encoded. Always specify encoding when working with CSV files.
- **PARSING**: Use Python's csv module for reliable parsing - raw text tools may fail due to embedded commas in data fields.
- **SIZE**: Repository contains 265MB of CSV data across 211 files. Operations are typically very fast (<0.5 seconds).
- **NO DEPENDENCIES**: Only requires Python 3 (standard library) for validation scripts. No package installation needed.

## When Working with Changes

- Always validate CSV integrity after modifications using the validation commands above
- Check that modified files maintain the 17-column structure
- Verify UTF-8 encoding is preserved
- Test data parsing with Python csv module before committing
- Remember: This is a data repository, not a software project - focus on data quality and format consistency