       *> ===========================================================
      *> ROUTE100 - Route Demand Analysis & Forecast
      *> ===========================================================
      *> Input  : one line per (route, year-month), pre-aggregated
      *>          by Python via SQL GROUP BY.
      *> Output : one line per route with total bookings, demand
      *>          level (HIGH/MEDIUM/LOW by share of grand total),
      *>          and next-month forecast (3-month moving average).
      *> ===========================================================
       >>SOURCE FORMAT FREE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. ROUTE100.

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
           05 IN-ROUTE-ID          PIC 9(4).
           05 IN-DEP-CITY          PIC X(15).
           05 IN-ARR-CITY          PIC X(15).
           05 IN-YEAR-MONTH        PIC 9(6).
           05 IN-BOOKING-COUNT     PIC 9(5).

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD           PIC X(52).

       WORKING-STORAGE SECTION.
       01  WS-INPUT-PATH           PIC X(150).
       01  WS-OUTPUT-PATH          PIC X(150).
       01  WS-IN-STATUS            PIC XX.
       01  WS-OUT-STATUS           PIC XX.
       01  WS-EOF-FLAG             PIC X VALUE 'N'.
       01  WS-FOUND                PIC X VALUE 'N'.
       01  WS-MONTH-IDX            PIC 9(2).
       01  WS-ROUTE-COUNT          PIC 9(4) VALUE 0.
       01  WS-GRAND-TOTAL          PIC 9(7) VALUE 0.
       01  WS-SHARE-PCT            PIC 9(3)V99.
       01  WS-FORECAST             PIC 9(5).
       01  WS-DEMAND-LEVEL         PIC X(6).

       01  WS-OUT-LINE.
           05 OUT-ROUTE-ID         PIC 9(4).
           05 OUT-DEP-CITY         PIC X(15).
           05 OUT-ARR-CITY        PIC X(15).
           05 OUT-TOTAL            PIC 9(7).
           05 OUT-DEMAND-LEVEL     PIC X(6).
           05 OUT-FORECAST         PIC 9(5).

      *> up to 20 distinct routes supported
       01  ROUTE-TABLE.
           05 ROUTE-ENTRY OCCURS 20 TIMES INDEXED BY RT-IDX.
              10 RT-ROUTE-ID       PIC 9(4) VALUE 0.
              10 RT-DEP-CITY       PIC X(15).
              10 RT-ARR-CITY       PIC X(15).
              10 RT-MONTHLY OCCURS 12 TIMES PIC 9(5) VALUE 0.
              10 RT-TOTAL          PIC 9(7) VALUE 0.

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
               VARYING RT-IDX FROM 1 BY 1
               UNTIL RT-IDX > WS-ROUTE-COUNT

           CLOSE INPUT-FILE
           CLOSE OUTPUT-FILE
           MOVE 0 TO RETURN-CODE
           GOBACK.

       PROCESS-RECORD.
           MOVE 'N' TO WS-FOUND
           PERFORM VARYING RT-IDX FROM 1 BY 1
                   UNTIL RT-IDX > WS-ROUTE-COUNT
               IF RT-ROUTE-ID(RT-IDX) = IN-ROUTE-ID
                   MOVE 'Y' TO WS-FOUND
                   EXIT PERFORM
               END-IF
           END-PERFORM

           IF WS-FOUND = 'N'
               ADD 1 TO WS-ROUTE-COUNT
               SET RT-IDX TO WS-ROUTE-COUNT
               MOVE IN-ROUTE-ID TO RT-ROUTE-ID(RT-IDX)
               MOVE IN-DEP-CITY TO RT-DEP-CITY(RT-IDX)
               MOVE IN-ARR-CITY TO RT-ARR-CITY(RT-IDX)
           END-IF

           COMPUTE WS-MONTH-IDX = FUNCTION MOD(IN-YEAR-MONTH, 100)
           ADD IN-BOOKING-COUNT TO RT-MONTHLY(RT-IDX, WS-MONTH-IDX)
           ADD IN-BOOKING-COUNT TO RT-TOTAL(RT-IDX)
           ADD IN-BOOKING-COUNT TO WS-GRAND-TOTAL.

       CLASSIFY-AND-WRITE.
           COMPUTE WS-SHARE-PCT ROUNDED =
               (RT-TOTAL(RT-IDX) * 100) / WS-GRAND-TOTAL

           EVALUATE TRUE
               WHEN WS-SHARE-PCT >= 15
                   MOVE "HIGH  " TO WS-DEMAND-LEVEL
               WHEN WS-SHARE-PCT >= 7
                   MOVE "MEDIUM" TO WS-DEMAND-LEVEL
               WHEN OTHER
                   MOVE "LOW   " TO WS-DEMAND-LEVEL
           END-EVALUATE

      *> 3-month moving average using Apr/May/Jun (idx 4,5,6)
      *> as the forecast basis for the next month (Jul)
           COMPUTE WS-FORECAST ROUNDED =
               (RT-MONTHLY(RT-IDX,4) + RT-MONTHLY(RT-IDX,5)
                + RT-MONTHLY(RT-IDX,6)) / 3

           MOVE RT-ROUTE-ID(RT-IDX)     TO OUT-ROUTE-ID
           MOVE RT-DEP-CITY(RT-IDX)     TO OUT-DEP-CITY
           MOVE RT-ARR-CITY(RT-IDX)     TO OUT-ARR-CITY
           MOVE RT-TOTAL(RT-IDX)        TO OUT-TOTAL
           MOVE WS-DEMAND-LEVEL         TO OUT-DEMAND-LEVEL
           MOVE WS-FORECAST             TO OUT-FORECAST

           WRITE OUTPUT-RECORD FROM WS-OUT-LINE.

       END PROGRAM ROUTE100.
