       *> ===========================================================
      *> AIRLINE100 - Airline Booking Share Analysis
      *> ===========================================================
      *> Input  : one line per (airline, year-month), pre-aggregated
      *>          by Python via SQL GROUP BY.
      *> Output : one line per airline with total bookings, total
      *>          revenue, and share tier (DOMINANT/MODERATE/MINOR
      *>          by share of grand total booking count).
      *> ===========================================================
       >>SOURCE FORMAT FREE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. AIRLINE100.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO WS-INPUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-IN-STATUS.
           SELECT OUTPUT-FILE ASSIGN TO WS-OUTPUT-PATH
               ORGANIZATION IS LINE SEQUENTIAL
               FILE STATUS IS WS-OUT-STATUS.

       DATA DIVISION.
       FILE SECTION.
       FD  INPUT-FILE.
       01  INPUT-RECORD.
           05 IN-AIRLINE-ID        PIC 9(4).
           05 IN-AIRLINE-NAME      PIC X(25).
           05 IN-YEAR-MONTH        PIC 9(6).
           05 IN-BOOKING-COUNT     PIC 9(5).
           05 IN-REVENUE           PIC 9(10)V99.

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD           PIC X(56).

       WORKING-STORAGE SECTION.
       01  WS-INPUT-PATH           PIC X(150).
       01  WS-OUTPUT-PATH          PIC X(150).
       01  WS-IN-STATUS            PIC XX.
       01  WS-OUT-STATUS           PIC XX.
       01  WS-EOF-FLAG             PIC X VALUE 'N'.
       01  WS-FOUND                PIC X VALUE 'N'.
       01  WS-AIRLINE-COUNT        PIC 9(4) VALUE 0.
       01  WS-GRAND-TOTAL-COUNT    PIC 9(7) VALUE 0.
       01  WS-SHARE-PCT            PIC 9(3)V99.
       01  WS-TIER                 PIC X(8).

       01  WS-OUT-LINE.
           05 OUT-AIRLINE-ID       PIC 9(4).
           05 OUT-AIRLINE-NAME     PIC X(25).
           05 OUT-TOTAL-COUNT      PIC 9(7).
           05 OUT-REVENUE          PIC 9(10)V99.
           05 OUT-TIER             PIC X(8).

      *> up to 10 airlines supported
       01  AIRLINE-TABLE.
           05 AIRLINE-ENTRY OCCURS 10 TIMES INDEXED BY AL-IDX.
              10 AL-AIRLINE-ID     PIC 9(4) VALUE 0.
              10 AL-AIRLINE-NAME   PIC X(25).
              10 AL-TOTAL-COUNT    PIC 9(7) VALUE 0.
              10 AL-TOTAL-REVENUE  PIC 9(10)V99 VALUE 0.

       PROCEDURE DIVISION.
       MAIN-PROCEDURE.
           DISPLAY 1 UPON ARGUMENT-NUMBER
           ACCEPT WS-INPUT-PATH FROM ARGUMENT-VALUE
           DISPLAY 2 UPON ARGUMENT-NUMBER
           ACCEPT WS-OUTPUT-PATH FROM ARGUMENT-VALUE

           OPEN INPUT INPUT-FILE
           IF WS-IN-STATUS NOT = "00"
               DISPLAY "ERROR: cannot open input file " WS-INPUT-PATH
               MOVE 1 TO RETURN-CODE
               GOBACK
           END-IF

           OPEN OUTPUT OUTPUT-FILE
           IF WS-OUT-STATUS NOT = "00"
               DISPLAY "ERROR: cannot open output file " WS-OUTPUT-PATH
               CLOSE INPUT-FILE
               MOVE 1 TO RETURN-CODE
               GOBACK
           END-IF

           PERFORM UNTIL WS-EOF-FLAG = 'Y'
               READ INPUT-FILE
                   AT END MOVE 'Y' TO WS-EOF-FLAG
                   NOT AT END PERFORM PROCESS-RECORD
               END-READ
           END-PERFORM

           PERFORM CLASSIFY-AND-WRITE
               VARYING AL-IDX FROM 1 BY 1
               UNTIL AL-IDX > WS-AIRLINE-COUNT

           CLOSE INPUT-FILE
           CLOSE OUTPUT-FILE
           MOVE 0 TO RETURN-CODE
           GOBACK.

       PROCESS-RECORD.
           MOVE 'N' TO WS-FOUND
           PERFORM VARYING AL-IDX FROM 1 BY 1
                   UNTIL AL-IDX > WS-AIRLINE-COUNT
               IF AL-AIRLINE-ID(AL-IDX) = IN-AIRLINE-ID
                   MOVE 'Y' TO WS-FOUND
                   EXIT PERFORM
               END-IF
           END-PERFORM

           IF WS-FOUND = 'N'
               ADD 1 TO WS-AIRLINE-COUNT
               SET AL-IDX TO WS-AIRLINE-COUNT
               MOVE IN-AIRLINE-ID   TO AL-AIRLINE-ID(AL-IDX)
               MOVE IN-AIRLINE-NAME TO AL-AIRLINE-NAME(AL-IDX)
           END-IF

           ADD IN-BOOKING-COUNT TO AL-TOTAL-COUNT(AL-IDX)
           ADD IN-REVENUE       TO AL-TOTAL-REVENUE(AL-IDX)
           ADD IN-BOOKING-COUNT TO WS-GRAND-TOTAL-COUNT.

       CLASSIFY-AND-WRITE.
           COMPUTE WS-SHARE-PCT ROUNDED =
               (AL-TOTAL-COUNT(AL-IDX) * 100) / WS-GRAND-TOTAL-COUNT

           EVALUATE TRUE
               WHEN WS-SHARE-PCT >= 25
                   MOVE "DOMINANT" TO WS-TIER
               WHEN WS-SHARE-PCT >= 10
                   MOVE "MODERATE" TO WS-TIER
               WHEN OTHER
                   MOVE "MINOR   " TO WS-TIER
           END-EVALUATE

           MOVE AL-AIRLINE-ID(AL-IDX)      TO OUT-AIRLINE-ID
           MOVE AL-AIRLINE-NAME(AL-IDX)    TO OUT-AIRLINE-NAME
           MOVE AL-TOTAL-COUNT(AL-IDX)     TO OUT-TOTAL-COUNT
           MOVE AL-TOTAL-REVENUE(AL-IDX)   TO OUT-REVENUE
           MOVE WS-TIER                    TO OUT-TIER

           WRITE OUTPUT-RECORD FROM WS-OUT-LINE.

       END PROGRAM AIRLINE100.
       