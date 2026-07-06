       IDENTIFICATION DIVISION.
       PROGRAM-ID. SEASON-TREND.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO
               '../../backend-python/data/season_trend_input.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO
               '../../backend-python/data/season_trend_output.txt'
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  INPUT-FILE.
       01  INPUT-RECORD            PIC X(500).

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD           PIC X(500).

       WORKING-STORAGE SECTION.
       01  WS-EOF-FLAG             PIC A(1) VALUE 'N'.

      *Input Fields (CSV)
       01  WS-MONTH-NUM-STR        PIC X(5).
       01  WS-MONTH-NAME           PIC X(20).
       01  WS-BOOKINGS-STR         PIC X(10).
       01  WS-REVENUE-STR          PIC X(15).

      *Numeric Fields
       01  WS-MONTH-NUM            PIC 9(2) VALUE ZERO.
       01  WS-BOOKINGS             PIC 9(9) VALUE ZERO.
       01  WS-REVENUE              PIC 9(13)V99 VALUE ZERO.

      *Output Fields
       01  WS-OUT-BOOKINGS         PIC Z(8)9.
       01  WS-OUT-REVENUE          PIC Z(12)9.
       01  WS-OUT-LABEL            PIC X(20).
       01  WS-OUT-DESC             PIC X(100).

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           OPEN INPUT INPUT-FILE
           OPEN OUTPUT OUTPUT-FILE

           PERFORM PROCESS-RECORD UNTIL WS-EOF-FLAG = 'Y'

           CLOSE INPUT-FILE
           CLOSE OUTPUT-FILE
           STOP RUN.

       PROCESS-RECORD.
           READ INPUT-FILE INTO INPUT-RECORD
               AT END
                   MOVE 'Y' TO WS-EOF-FLAG
               NOT AT END
                   PERFORM PARSE-AND-CALCULATE
           END-READ.

       PARSE-AND-CALCULATE.
           MOVE SPACES TO WS-MONTH-NUM-STR WS-MONTH-NAME
           MOVE SPACES TO WS-BOOKINGS-STR WS-REVENUE-STR

           UNSTRING INPUT-RECORD DELIMITED BY ','
               INTO WS-MONTH-NUM-STR
                    WS-MONTH-NAME
                    WS-BOOKINGS-STR
                    WS-REVENUE-STR
           END-UNSTRING.

           COMPUTE WS-MONTH-NUM = FUNCTION NUMVAL(WS-MONTH-NUM-STR).
           COMPUTE WS-BOOKINGS = FUNCTION NUMVAL(WS-BOOKINGS-STR).
           COMPUTE WS-REVENUE = FUNCTION NUMVAL(WS-REVENUE-STR).

           IF WS-MONTH-NUM = 4
               MOVE 'HIGH' TO WS-OUT-LABEL
               MOVE 'Thingyan Festival drives peak domestic travel'
                TO WS-OUT-DESC
           ELSE IF WS-MONTH-NUM = 10 OR WS-MONTH-NUM = 11 OR
            WS-MONTH-NUM = 12
               MOVE 'HIGH' TO WS-OUT-LABEL
               MOVE 'Winter tourism and holiday season peak'
               TO WS-OUT-DESC
           ELSE IF WS-MONTH-NUM = 6 OR WS-MONTH-NUM = 7
               MOVE 'LOW' TO WS-OUT-LABEL
               MOVE 'Monsoon season reduces leisure travel'
               TO WS-OUT-DESC
           ELSE
               MOVE 'NORMAL' TO WS-OUT-LABEL
               MOVE 'Standard seasonal demand' TO WS-OUT-DESC
           END-IF.

           MOVE WS-BOOKINGS TO WS-OUT-BOOKINGS.
           MOVE WS-REVENUE TO WS-OUT-REVENUE.

           MOVE SPACES TO OUTPUT-RECORD.
           STRING 'MONTH|'
                  FUNCTION TRIM(WS-MONTH-NUM-STR) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-MONTH-NAME) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-BOOKINGS) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-REVENUE) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-LABEL) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-DESC) DELIMITED BY SIZE
                  INTO OUTPUT-RECORD
           END-STRING.
           WRITE OUTPUT-RECORD.
