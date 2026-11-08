<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student ID Cards Batch</title>
    <style>
        @page {
            margin: 20pt;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
        }
        .cards-grid {
            display: table;
            width: 100%;
        }
        .card-row {
            display: table-row;
            page-break-inside: avoid;
        }
        .card-cell {
            display: table-cell;
            width: 50%;
            padding: 10pt;
            vertical-align: top;
        }
        .id-card {
            width: 243pt;
            height: 153pt;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 14pt;
            color: white;
            position: relative;
            overflow: hidden;
            margin-bottom: 20pt;
            page-break-inside: avoid;
        }
        .card-header {
            text-align: center;
            margin-bottom: 10pt;
            border-bottom: 1.5pt solid rgba(255, 255, 255, 0.4);
            padding-bottom: 6pt;
        }
        .card-header h2 {
            font-size: 11pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
            margin-bottom: 2pt;
        }
        .card-header p {
            font-size: 7pt;
            opacity: 0.95;
        }
        .card-body {
            display: table;
            width: 100%;
            margin-bottom: 10pt;
        }
        .photo-section {
            display: table-cell;
            width: 60pt;
            vertical-align: middle;
        }
        .photo {
            width: 60pt;
            height: 60pt;
            border-radius: 6pt;
            background: white;
            overflow: hidden;
            border: 2pt solid rgba(255, 255, 255, 0.6);
        }
        .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .info-section {
            display: table-cell;
            padding-left: 10pt;
            vertical-align: middle;
        }
        .info-row {
            margin-bottom: 4pt;
        }
        .info-label {
            font-size: 6pt;
            opacity: 0.85;
            text-transform: uppercase;
            letter-spacing: 0.3pt;
        }
        .info-value {
            font-size: 8pt;
            font-weight: bold;
            margin-top: 1pt;
        }
        .card-footer {
            border-top: 1.5pt solid rgba(255, 255, 255, 0.4);
            padding-top: 6pt;
            text-align: center;
        }
        .card-number {
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: 1pt;
            background: rgba(255, 255, 255, 0.25);
            padding: 4pt 10pt;
            border-radius: 4pt;
            display: inline-block;
        }
        .department {
            font-size: 6pt;
            margin-top: 3pt;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="cards-grid">
        @foreach($cards->chunk(2) as $row)
            <div class="card-row">
                @foreach($row as $card)
                    <div class="card-cell">
                        <div class="id-card">
                            <div class="card-header">
                                <h2>Student Management System</h2>
                                <p>Official Student Identification Card</p>
                            </div>

                            <div class="card-body">
                                <div class="photo-section">
                                    <div class="photo">
                                        @if($card->student->photo_path && file_exists(storage_path('app/public/' . $card->student->photo_path)))
                                            <img src="{{ storage_path('app/public/' . $card->student->photo_path) }}" alt="{{ $card->student->full_name }}">
                                        @endif
                                    </div>
                                </div>

                                <div class="info-section">
                                    <div class="info-row">
                                        <div class="info-label">Name</div>
                                        <div class="info-value">{{ strtoupper($card->student->full_name) }}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Student No.</div>
                                        <div class="info-value">{{ $card->student->student_number }}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Program</div>
                                        <div class="info-value">{{ $card->student->program }}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Year & Section</div>
                                        <div class="info-value">{{ $card->student->year_level }} - {{ $card->student->section }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="card-footer">
                                <div class="card-number">{{ $card->card_number }}</div>
                                <div class="department">{{ $card->student->department }}</div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @endforeach
    </div>
</body>
</html>
