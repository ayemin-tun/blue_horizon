       IDENTIFICATION DIVISION.
       PROGRAM-ID. REVENUE-CALC.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO
               '../../backend-python/data/cobol_input.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO
               '../../backend-python/data/cobol_output.txt'
               ORGANIZATION IS LINE SEQUENTIAL.

       DATA DIVISION.
       FILE SECTION.
       FD  INPUT-FILE.
       01  INPUT-RECORD            PIC X(500).

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD           PIC X(100).

       WORKING-STORAGE SECTION.
       01  WS-EOF-FLAG             PIC A(1) VALUE 'N'.
       01  WS-TOTAL-REVENUE        PIC 9(9)V99 VALUE ZERO.
       01  WS-CANCELLED-COUNT      PIC 9(4) VALUE ZERO.
       01  WS-CONFIRMED-COUNT      PIC 9(4) VALUE ZERO.

      *Fields for UNSTRING (CSV parsing)
       01  WS-BOOKING-ID           PIC X(10).
       01  WS-FLIGHT-DATE          PIC X(15).
       01  WS-DEPART-TIME          PIC X(10).
       01  WS-PRICE-STR            PIC X(15).
       01  WS-PRICE-NUM            PIC 9(7)V99.
       01  WS-STATUS               PIC X(15).
       01  WS-PASSENGER-TYPE       PIC X(10).
       01  WS-OUT-REVENUE          PIC Z(9).99.

       PROCEDURE DIVISION.
       MAIN-LOGIC.
           OPEN INPUT INPUT-FILE
           OPEN OUTPUT OUTPUT-FILE

           PERFORM PROCESS-RECORD UNTIL WS-EOF-FLAG = 'Y'

           PERFORM WRITE-REPORT

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
      *Split CSV by Comma
           UNSTRING INPUT-RECORD DELIMITED BY ','
               INTO WS-BOOKING-ID
                    WS-FLIGHT-DATE
                    WS-DEPART-TIME
                    WS-PRICE-STR
                    WS-STATUS
                    WS-PASSENGER-TYPE
           END-UNSTRING.

      *Convert String Price to Number
           COMPUTE WS-PRICE-NUM = FUNCTION NUMVAL(WS-PRICE-STR).

      *Business Logic: Calculate Revenue based on Status
           IF WS-STATUS(1:9) = 'CONFIRMED'
               ADD WS-PRICE-NUM TO WS-TOTAL-REVENUE
               ADD 1 TO WS-CONFIRMED-COUNT
           ELSE IF WS-STATUS(1:9) = 'CANCELLED'
               ADD 1 TO WS-CANCELLED-COUNT
           END-IF.

       WRITE-REPORT.
           MOVE SPACES TO OUTPUT-RECORD
           STRING '--- DAILY REVENUE REPORT ---'
               DELIMITED BY SIZE INTO OUTPUT-RECORD
           END-STRING
           WRITE OUTPUT-RECORD.

           MOVE SPACES TO OUTPUT-RECORD
           STRING 'Total Confirmed Bookings: ' WS-CONFIRMED-COUNT
               DELIMITED BY SIZE INTO OUTPUT-RECORD
           END-STRING
           WRITE OUTPUT-RECORD.

           MOVE SPACES TO OUTPUT-RECORD
           STRING 'Total Cancelled Bookings: ' WS-CANCELLED-COUNT
               DELIMITED BY SIZE INTO OUTPUT-RECORD
           END-STRING
           WRITE OUTPUT-RECORD.

           MOVE WS-TOTAL-REVENUE TO WS-OUT-REVENUE
           MOVE SPACES TO OUTPUT-RECORD
           STRING 'Total Revenue (MMK): ' WS-OUT-REVENUE
               DELIMITED BY SIZE INTO OUTPUT-RECORD
           END-STRING
           WRITE OUTPUT-RECORD.
