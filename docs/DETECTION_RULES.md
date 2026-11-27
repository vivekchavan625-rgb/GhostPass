# GhostPass Detection Rules & Algorithms

## Detection Hierarchy & Priority Matrix

When multiple detectors match overlapping spans of text, GhostPass resolves overlaps deterministically using the following strict priority order:

1. **Credit / Debit Card** (`credit-card`) — Highest priority
2. **Aadhaar Number** (`aadhaar`)
3. **Permanent Account Number** (`pan`)
4. **Email Address** (`email`)
5. **IPv4 Address** (`ipv4`)
6. **Phone Number** (`phone-in` / `phone-intl`) — Lowest priority

*Tie-breaker rule*: If two entities have equal detector priority, the entity with the **longer text span** wins.

---

## Detailed Detector Specifications

### 1. Credit & Debit Cards (`credit-card`)
- **Category**: `card`
- **Pattern**: 13 to 19 digits, allowing optional hyphens `-` or spaces between 4-digit groups (e.g., `4532-1234-5678-9010`, `378282246310005`).
- **Validation**: Mandatory **Luhn checksum algorithm** (`src/engine/validators/luhn.ts`). Strips all non-digit characters and computes mod 10 doubling every second digit from right to left.
- **Confidence**: `high` when Luhn passes and length is between 13 and 19 digits.

### 2. Indian Aadhaar Number (`aadhaar`)
- **Category**: `aadhaar`
- **Pattern**: Exactly 12 digits, formatted optionally as `XXXX XXXX XXXX` or `XXXX-XXXX-XXXX`, or 12 contiguous digits.
- **Validation**: Mandatory **Verhoeff checksum algorithm** (`src/engine/validators/verhoeff.ts`). Must NOT start with 0 or 1.
- **Confidence**: `high` when Verhoeff checksum validates.

### 3. Indian PAN Card (`pan`)
- **Category**: `pan`
- **Pattern**: Standard Indian Income Tax Permanent Account Number syntax:
  - 5 uppercase letters (`[A-Z]{5}`)
  - 4 numeric digits (`[0-9]{4}`)
  - 1 uppercase letter (`[A-Z]`)
  - Total length: exactly 10 alphanumeric characters.
- **Validation**: 4th character must be a valid entity code (`P` for individual, `C` for company, `H` for HUF, `F` for firm, `A` for AOP, `T` for trust, etc.).
- **Confidence**: `high`.

### 4. Email Address (`email`)
- **Category**: `email`
- **Pattern**: Bounded RFC 5322 regex scanning alphanumeric and permitted symbol sequences before `@`, followed by valid domain and TLD (at least 2 characters).
- **Validation**: Excludes trailing punctuation (`.`, `,`, `!`, `?`), requires valid top-level domain format, bounds username/domain segments to RFC limits.
- **Confidence**: `high`.

### 5. IPv4 Address (`ipv4`)
- **Category**: `ipv4`
- **Pattern**: Dotted quad decimal notation `d{1,3}\.d{1,3}\.d{1,3}\.d{1,3}`.
- **Validation**:
  - Each octet must be an integer between `0` and `255`.
  - Rejects contextual version strings (e.g., `v1.2.3.4`, `version 2.0.1.5`).
- **Confidence**: `high`.

### 6. Indian Phone Numbers (`phone-in`)
- **Category**: `phone`
- **Pattern**: 10-digit Indian numbers starting with digits `6`, `7`, `8`, or `9`, with optional `+91` or `0` prefix and optional space/hyphen separators.
- **Validation**: Standard length and initial digit verification.
- **Confidence**: `medium` (due to high likelihood of colliding with other numeric identifiers).

### 7. International Phone Numbers (`phone-intl`)
- **Category**: `phone`
- **Pattern**: E.164-like notation starting with `+`, followed by 1 to 3 country code digits, and 7 to 14 subscriber digits.
- **Validation**: Total digit count between 8 and 15 digits.
- **Confidence**: `medium`.

---

## Redaction Transformations

| Category | Full Redaction Token | Partial Mask Example | Pseudonym Format |
|:---------|:---------------------|:---------------------|:-----------------|
| `email`  | `[REDACTED_EMAIL]`   | `v***@example.com`   | `USER_01`        |
| `phone`  | `[REDACTED_PHONE]`   | `98XXXXXX10`         | `PHONE_01`       |
| `card`   | `[REDACTED_CARD]`    | `XXXX-XXXX-XXXX-1234`| `CARD_01`        |
| `aadhaar`| `[REDACTED_AADHAAR]` | `XXXX XXXX 1234`     | `AADHAAR_01`     |
| `pan`    | `[REDACTED_PAN]`     | `ABXXXXX34F`         | `PAN_01`         |
| `ipv4`   | `[REDACTED_IP]`      | `192.XXX.XXX.XXX`    | `IP_01`          |
