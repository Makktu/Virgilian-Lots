import json
import re

def convert_aeneid_to_json(input_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    aeneid = {"books": []}
    current_book = None
    current_line_number = 0

    # Split into lines
    lines = content.split('\n')
    in_argument = False
    in_prelude = False

    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue

        # Check for new book
        if line.strip().startswith('BOOK '):
            if current_book:
                aeneid["books"].append(current_book)
            book_num = len(aeneid["books"]) + 1
            current_book = {
                "bookNumber": book_num,
                "lines": []
            }
            in_argument = True
            current_line_number = 0
            continue

        # Handle argument section
        if line.strip() == 'ARGUMENT.':
            in_argument = True
            continue

        if in_argument:
            if line.strip().startswith('_'):
                in_prelude = True
            if not line.strip():  # Empty line after argument ends it
                in_argument = False
            continue

        # Skip prelude (italicized lines)
        if in_prelude:
            if not line.strip().startswith('_'):
                in_prelude = False
            else:
                continue

        # Process verse lines
        line = line.strip()
        if line and current_book is not None:
            # Check for line number at the end
            number_match = re.search(r'\s+(\d+)\s*$', line)
            if number_match:
                actual_number = int(number_match.group(1))
                # Verify our counting
                if current_line_number + 1 != actual_number:
                    print(f"Warning: Line number mismatch in Book {current_book['bookNumber']}")
                    print(f"Expected: {current_line_number + 1}, Found: {actual_number}")
                current_line_number = actual_number
                # Remove the line number
                line = re.sub(r'\s+\d+\s*$', '', line)
            else:
                current_line_number += 1

            # Clean up the line
            line = line.strip()
            if line:  # Only add non-empty lines
                current_book["lines"].append({
                    "lineNumber": current_line_number,
                    "text": line
                })

    # Add the final book
    if current_book:
        aeneid["books"].append(current_book)

    return aeneid

if __name__ == "__main__":
    input_file = "morris_aeneid_sample.txt"
    output_file = "aeneid.json"

    aeneid_json = convert_aeneid_to_json(input_file)

    # Save to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(aeneid_json, f, indent=2, ensure_ascii=False)

    # Print statistics and validation
    total_lines = sum(len(book["lines"]) for book in aeneid_json["books"])
    print(f"\nProcessed {len(aeneid_json['books'])} books")
    print(f"Total lines: {total_lines}")

    # Print sample for verification
    if aeneid_json["books"]:
        print("\nSample of first few lines:")
        for line in aeneid_json["books"][0]["lines"][:10]:
            print(f"Line {line['lineNumber']}: {line['text']}")
