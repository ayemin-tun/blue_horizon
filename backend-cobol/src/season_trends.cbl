       *> ===========================================================
      *> SEASON100 - Seasonal Travel Trend Analysis
      *> ===========================================================
      *> Input  : one line per year-month (already aggregated by
      *>          Python via SQL GROUP BY), in ascending month order.
      *> Output : one line per month with season level (PEAK/NORMAL/
      *>          LOW by share of grand total), month-over-month
      *>          growth % (signed), and a 3-month moving average
      *>          forecast trailing that month.
      *> ===========================================================
       >>SOURCE FORMAT FREE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. SEASON100.

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
           05 IN-YEAR-MONTH        PIC 9(6).
           05 IN-BOOKING-COUNT     PIC 9(5).
           05 IN-REVENUE           PIC 9(10)V99.

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD           PIC X(40).

       WORKING-STORAGE SECTION.
       01  WS-INPUT-PATH           PIC X(150).
       01  WS-OUTPUT-PATH          PIC X(150).
       01  WS-IN-STATUS            PIC XX.
       01  WS-OUT-STATUS           PIC XX.
       01  WS-EOF-FLAG             PIC X VALUE 'N'.
       01  WS-MONTH-COUNT          PIC 9(4) VALUE 0.
       01  WS-GRAND-TOTAL          PIC 9(7) VALUE 0.
       01  WS-SHARE-PCT            PIC 9(3)V99.
       01  WS-SEASON-LEVEL         PIC X(6).
       01  WS-MOM-GROWTH           PIC S9(3)V99.
       01  WS-FORECAST             PIC 9(5).

       01  WS-OUT-LINE.
           05 OUT-YEAR-MONTH       PIC 9(6).
           05 OUT-BOOKING-COUNT    PIC 9(5).
           05 OUT-REVENUE          PIC 9(10)V99.
           05 OUT-SEASON-LEVEL     PIC X(6).
           05 OUT-MOM-GROWTH       PIC S9(3)V99 SIGN LEADING SEPARATE.
           05 OUT-FORECAST         PIC 9(5).

      *> up to 12 months supported (one calendar year)
       01  SEASON-TABLE.
           05 SEASON-ENTRY OCCURS 12 TIMES INDEXED BY SN-IDX.
              10 SN-YEAR-MONTH     PIC 9(6).
              10 SN-BOOKING-COUNT  PIC 9(5).
              10 SN-REVENUE        PIC 9(10)V99.

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
               VARYING SN-IDX FROM 1 BY 1
               UNTIL SN-IDX > WS-MONTH-COUNT

           CLOSE INPUT-FILE
           CLOSE OUTPUT-FILE
           MOVE 0 TO RETURN-CODE
           GOBACK.

      *> input is already one row per month, in order -> just append
       PROCESS-RECORD.
           ADD 1 TO WS-MONTH-COUNT
           SET SN-IDX TO WS-MONTH-COUNT
           MOVE IN-YEAR-MONTH    TO SN-YEAR-MONTH(SN-IDX)
           MOVE IN-BOOKING-COUNT TO SN-BOOKING-COUNT(SN-IDX)
           MOVE IN-REVENUE       TO SN-REVENUE(SN-IDX)
           ADD IN-BOOKING-COUNT  TO WS-GRAND-TOTAL.

       CLASSIFY-AND-WRITE.
           COMPUTE WS-SHARE-PCT ROUNDED =
               (SN-BOOKING-COUNT(SN-IDX) * 100) / WS-GRAND-TOTAL

           EVALUATE TRUE
               WHEN WS-SHARE-PCT >= 20
                   MOVE "PEAK  " TO WS-SEASON-LEVEL
               WHEN WS-SHARE-PCT >= 12
                   MOVE "NORMAL" TO WS-SEASON-LEVEL
               WHEN OTHER
                   MOVE "LOW   " TO WS-SEASON-LEVEL
           END-EVALUATE

      *> month-over-month growth %: no "previous month" for the
      *> first row, so growth is reported as 0 in that case
           IF SN-IDX = 1
               MOVE 0 TO WS-MOM-GROWTH
           ELSE
               COMPUTE WS-MOM-GROWTH ROUNDED =
                   ((SN-BOOKING-COUNT(SN-IDX) - 
                   SN-BOOKING-COUNT(SN-IDX - 1))
                    * 100) / SN-BOOKING-COUNT(SN-IDX - 1)
           END-IF

      *> 3-month moving average trailing this month (once >= 3 months
      *> of history exist); otherwise just echo this month's count
           IF SN-IDX >= 3
               COMPUTE WS-FORECAST ROUNDED =
                   (SN-BOOKING-COUNT(SN-IDX) + 
                   SN-BOOKING-COUNT(SN-IDX - 1)
                    + SN-BOOKING-COUNT(SN-IDX - 2)) / 3
           ELSE
               MOVE SN-BOOKING-COUNT(SN-IDX) TO WS-FORECAST
           END-IF

           MOVE SN-YEAR-MONTH(SN-IDX)    TO OUT-YEAR-MONTH
           MOVE SN-BOOKING-COUNT(SN-IDX) TO OUT-BOOKING-COUNT
           MOVE SN-REVENUE(SN-IDX)       TO OUT-REVENUE
           MOVE WS-SEASON-LEVEL          TO OUT-SEASON-LEVEL
           MOVE WS-MOM-GROWTH            TO OUT-MOM-GROWTH
           MOVE WS-FORECAST              TO OUT-FORECAST

           WRITE OUTPUT-RECORD FROM WS-OUT-LINE.

       END PROGRAM SEASON100.
       