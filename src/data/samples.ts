export interface SampleData {
  id: string;
  title: string;
  description: string;
  categoryTags: string[];
  content: string;
}

export const SYNTHETIC_SAMPLES: SampleData[] = [
  {
    id: 'support-ticket',
    title: 'Customer Support Escalation Ticket',
    description: 'Ticket containing user contact details, account IP, and false-positive version numbers.',
    categoryTags: ['email', 'phone', 'ipv4'],
    content: `From: priya.sharma@example.com
To: support-desk@example.com
Date: 2026-03-14 09:23:11 IST
Subject: Unable to access dashboard after v2.4.1 upgrade

Hello Support,
I am writing from customer terminal 192.168.1.105. After upgrading our agent to version 3.0.1.2 on build v1.0.4.9, the authentication hook fails.
You can call my mobile number +91 98201 12345 or my alternate line 098202 54321 between 10am and 6pm.
Order ID ORD-9820112345 has also failed.
Please resolve this urgently.`
  },
  {
    id: 'resume',
    title: 'Candidate Software Engineer Resume',
    description: 'Resume with personal contact details, email, and Indian PAN card.',
    categoryTags: ['email', 'phone', 'pan'],
    content: `RAHUL K. VERMA
Senior Distributed Systems Architect
Email: rahul.verma.dev@example.org | Tel: +91-9876543210
Location: Bengaluru, Karnataka

IDENTIFICATION & TAX:
PAN Card: ABCPV1234K (Verified)
GitHub: https://github.com/rahulv-dev (Release v4.2.0 active)

EXPERIENCE:
Staff Engineer - Cloud Scale Systems (2021 - Present)
- Architected data pipelines processing over 10M events/sec.
- Handled telemetry logs with source IPv4 ranges and zero data loss.`
  },
  {
    id: 'auth-log',
    title: 'Server Security & Auth Log',
    description: 'Syslog file containing real-looking internal IPs, admin emails, and noise version tags.',
    categoryTags: ['ipv4', 'email'],
    content: `[2026-03-20T04:12:01.002Z] INFO [kernel] Starting auth-gateway release 4.12.0.1 (kernel 5.15.0)
[2026-03-20T04:12:02.115Z] WARN [sshd] Failed password for root from 10.0.4.15 port 42112 ssh2
[2026-03-20T04:12:05.412Z] INFO [audit] Security alert sent to sec-ops@example.net
[2026-03-20T04:12:07.889Z] WARN [sshd] Repeated failed attempt from 172.16.254.1; blocking peer
[2026-03-20T04:12:10.001Z] INFO [heartbeat] node ping 127.0.0.1 status OK (agent v1.2.3.4)`
  },
  {
    id: 'csv-customer-export',
    title: 'Customer Directory CSV Export',
    description: 'Tabular CSV data containing credit cards, PAN, phones, and emails with noise columns.',
    categoryTags: ['credit-card', 'pan', 'phone', 'email'],
    content: `CustomerId,CustomerName,EmailAddress,ContactNumber,TaxId,CardOnHold
1001,Ananya Roy,ananya.roy@example.com,+91 91234 56789,BKZPR8901L,4532-0150-1234-5671
1002,Vikram Malhotra,vikram.m@example.org,09811122334,AABCM9012N,5555 4444 3333 1111
1003,Devendra Sen,dev.sen@example.com,+1 415 555 2671,CRTPK4567M,4111111111111111
1004,Invalid Test,fake@example.com,0000000000,INVALIDPAN,4111000000000002`
  },
  {
    id: 'healthcare-notes',
    title: 'Clinical Encounter & Insurance Note',
    description: 'Patient medical intake with Aadhaar identity number, doctor email, and phone contact.',
    categoryTags: ['aadhaar', 'email', 'phone'],
    content: `CLINICAL INTAKE RECORD — METRO CARE CLINIC
Patient: Aarav Patel | DOB: 1984-07-12 | Blood Group: O+
National Identity (Aadhaar): 3675 9834 6016
Emergency Contact: +91 97654 32109 (Spouse - Meera Patel)
Attending Physician: dr.sunita.rao@example.com
Encounter ID: ENC-2026-367598346016
Prescription: Paracetamol 500mg TDS, dosage code v2.0.0`
  },
  {
    id: 'mixed-stress-test',
    title: 'Complex Multi-Category Stress & Noise Test',
    description: 'Dense multiline payload challenging overlap priority, formatting variations, and noise.',
    categoryTags: ['credit-card', 'aadhaar', 'pan', 'email', 'ipv4', 'phone'],
    content: `AUDIT & COMPLIANCE STRESS SUITE:
1. Credit Card: 4532 0150 1234 5671 (Visa valid Luhn), 4111-1111-1111-1111
2. Aadhaar: 3675 9834 6016 and 2198 7654 3210 (valid Verhoeff)
3. Tax PAN: AABCP1234Q, DFRPS5432Z
4. Network IPv4: Gateway 192.168.0.1, DNS 8.8.8.8, sub 10.100.50.25
5. Phones: +91 99887 76655, 09876543210, and +1-202-555-0143
6. Emails: contact-test.user+tag@example.co.uk, admin.root@sub.example.com
7. Adversarial Noise (Must NOT be flagged):
   - Version numbers: v1.2.3.4, version 2.0.1.5, release 1.0.0.0
   - Invalid Card (Luhn fail): 4532 0150 1234 5679
   - Invalid Aadhaar (starts with 0): 0123 4567 8901
   - Invalid PAN (bad 4th char): AAAZ99999Z
   - Invalid Octet: 300.1.2.3, 192.168.1.256
   - Order codes: ORD-9988776655, SKU-4532015012345678`
  }
];
