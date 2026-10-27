<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student ID Card - {{ $student->full_name }}</title>
    <style>
        @page {
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            width: 243pt;
            height: 153pt;
        }
        .id-card {
            width: 100%;
            height: 100%;
            background: #1e5956;
            color: white;
            position: relative;
            display: flex;
            flex-direction: column;
        }
        /* Header Section - Dark Green */
        .card-header {
            background: #0f3d3a;
            padding: 8pt 10pt;
            text-align: center;
            flex-shrink: 0;
        }
        .university-name {
            font-size: 9pt;
            font-weight: bold;
            letter-spacing: 0.8pt;
            margin-bottom: 1pt;
        }
        .university-location {
            font-size: 5.5pt;
            opacity: 0.95;
            letter-spacing: 0.3pt;
        }
        .card-title {
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 0.8pt;
            margin-top: 4pt;
        }
        /* Body Section */
        .card-body {
            display: table;
            width: 100%;
            padding: 12pt 12pt 8pt 12pt;
            flex: 1;
        }
        .photo-section {
            display: table-cell;
            width: 52pt;
            vertical-align: top;
        }
        .photo {
            width: 50pt;
            height: 50pt;
            background: white;
            border: 2pt solid #FFD700;
            overflow: hidden;
            display: block;
        }
        .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .info-section {
            display: table-cell;
            padding-left: 10pt;
            vertical-align: top;
        }
        .student-name {
            font-size: 11pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
            line-height: 1.3;
            border-bottom: 1pt solid #FFD700;
            padding-bottom: 4pt;
            margin-bottom: 6pt;
        }
        .program {
            font-size: 10pt;
            font-weight: bold;
            margin-top: 2pt;
        }
        /* Footer Section - Dark */
        .card-footer {
            background: #0a2625;
            padding: 7pt 12pt 6pt 12pt;
            flex-shrink: 0;
        }
        .footer-row {
            display: table;
            width: 100%;
            margin-bottom: 3pt;
        }
        .footer-label {
            display: table-cell;
            font-size: 5.5pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
            width: 45%;
        }
        .footer-value {
            display: table-cell;
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
        }
        .signature-section {
            margin-top: 5pt;
            padding-top: 4pt;
            border-top: 1pt solid rgba(255, 215, 0, 0.3);
        }
        .signature-line {
            font-size: 5pt;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="id-card">
        <!-- Header -->
        <div class="card-header">
            <div class="university-name">MINDORO STATE UNIVERSITY</div>
            <div class="university-location">ORIENTAL MINDORO, PHILIPPINES 5211</div>
            <div class="card-title">STUDENT IDENTIFICATION CARD</div>
        </div>

        <!-- Body -->
        <div class="card-body">
            <div class="photo-section">
                <div class="photo">
                    @if($student->photo_path && file_exists(storage_path('app/public/' . $student->photo_path)))
                        <img src="{{ storage_path('app/public/' . $student->photo_path) }}" alt="{{ $student->full_name }}">
                    @endif
                </div>
            </div>

            <div class="info-section">
                <div class="student-name">
                    {{ strtoupper($student->last_name) }}<br>
                    {{ strtoupper($student->first_name) }} {{ strtoupper(substr($student->middle_name ?? '', 0, 1)) }}.
                </div>
                <div class="program">{{ strtoupper($student->program) }}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="card-footer">
            <div class="footer-row">
                <div class="footer-label">STUDENT ID NUMBER</div>
                <div class="footer-value">{{ $student->student_number }}</div>
            </div>
            <div class="footer-row">
                <div class="footer-label">ISSUED</div>
                <div class="footer-value">AY {{ now()->format('Y') }}-{{ now()->addYear()->format('Y') }}</div>
            </div>
            <div class="signature-section">
                <div class="signature-line">University President</div>
            </div>
        </div>
    </div>
</body>
</html>
