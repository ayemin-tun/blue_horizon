       *> ===========================================================
      *> AGENT100 - Agent Performance Analysis
      *> ===========================================================
      *> Input  : one line per (agent, year-month), pre-aggregated
      *>          by Python via SQL GROUP BY (CONFIRMED bookings
      *>          only, role='agent').
      *> Output : one line per agent with total bookings, total
      *>          revenue, and performance tier (TOP/AVERAGE/LOW
      *>          by share of grand total booking count).
      *> ===========================================================
      
       >>SOURCE FORMAT FREE
       IDENTIFICATION DIVISION.
       PROGRAM-ID. AGENT100.

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
           05 IN-AGENT-ID          PIC 9(4).
           05 IN-AGENT-NAME        PIC X(20).
           05 IN-YEAR-MONTH        PIC 9(6).
           05 IN-BOOKING-COUNT     PIC 9(5).
           05 IN-REVENUE           PIC 9(10)V99.

       FD  OUTPUT-FILE.
       01  OUTPUT-RECORD           PIC X(51).

       WORKING-STORAGE SECTION.
       01  WS-INPUT-PATH           PIC X(150).
       01  WS-OUTPUT-PATH          PIC X(150).
       01  WS-IN-STATUS            PIC XX.
       01  WS-OUT-STATUS           PIC XX.
       01  WS-EOF-FLAG             PIC X VALUE 'N'.
       01  WS-FOUND                PIC X VALUE 'N'.
       01  WS-AGENT-COUNT          PIC 9(4) VALUE 0.
       01  WS-GRAND-TOTAL-COUNT    PIC 9(7) VALUE 0.
       01  WS-SHARE-PCT            PIC 9(3)V99.
       01  WS-TIER                 PIC X(8).

       01  WS-OUT-LINE.
           05 OUT-AGENT-ID         PIC 9(4).
           05 OUT-AGENT-NAME       PIC X(20).
           05 OUT-TOTAL-COUNT      PIC 9(7).
           05 OUT-REVENUE          PIC 9(10)V99.
           05 OUT-TIER             PIC X(8).

      *> up to 10 agents supported
       01  AGENT-TABLE.
           05 AGENT-ENTRY OCCURS 10 TIMES INDEXED BY AG-IDX.
              10 AG-AGENT-ID       PIC 9(4) VALUE 0.
              10 AG-AGENT-NAME     PIC X(20).
              10 AG-TOTAL-COUNT    PIC 9(7) VALUE 0.
              10 AG-TOTAL-REVENUE  PIC 9(10)V99 VALUE 0.

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
               VARYING AG-IDX FROM 1 BY 1
               UNTIL AG-IDX > WS-AGENT-COUNT

           CLOSE INPUT-FILE
           CLOSE OUTPUT-FILE
           MOVE 0 TO RETURN-CODE
           GOBACK.

       PROCESS-RECORD.
           MOVE 'N' TO WS-FOUND
           PERFORM VARYING AG-IDX FROM 1 BY 1
                   UNTIL AG-IDX > WS-AGENT-COUNT
               IF AG-AGENT-ID(AG-IDX) = IN-AGENT-ID
                   MOVE 'Y' TO WS-FOUND
                   EXIT PERFORM
               END-IF
           END-PERFORM

           IF WS-FOUND = 'N'
               ADD 1 TO WS-AGENT-COUNT
               SET AG-IDX TO WS-AGENT-COUNT
               MOVE IN-AGENT-ID   TO AG-AGENT-ID(AG-IDX)
               MOVE IN-AGENT-NAME TO AG-AGENT-NAME(AG-IDX)
           END-IF

           ADD IN-BOOKING-COUNT TO AG-TOTAL-COUNT(AG-IDX)
           ADD IN-REVENUE       TO AG-TOTAL-REVENUE(AG-IDX)
           ADD IN-BOOKING-COUNT TO WS-GRAND-TOTAL-COUNT.

       CLASSIFY-AND-WRITE.
           COMPUTE WS-SHARE-PCT ROUNDED =
               (AG-TOTAL-COUNT(AG-IDX) * 100) / WS-GRAND-TOTAL-COUNT

           EVALUATE TRUE
               WHEN WS-SHARE-PCT >= 25
                   MOVE "TOP     " TO WS-TIER
               WHEN WS-SHARE-PCT >= 10
                   MOVE "AVERAGE " TO WS-TIER
               WHEN OTHER
                   MOVE "LOW     " TO WS-TIER
           END-EVALUATE

           MOVE AG-AGENT-ID(AG-IDX)      TO OUT-AGENT-ID
           MOVE AG-AGENT-NAME(AG-IDX)    TO OUT-AGENT-NAME
           MOVE AG-TOTAL-COUNT(AG-IDX)   TO OUT-TOTAL-COUNT
           MOVE AG-TOTAL-REVENUE(AG-IDX) TO OUT-REVENUE
           MOVE WS-TIER                  TO OUT-TIER

           WRITE OUTPUT-RECORD FROM WS-OUT-LINE.

       END PROGRAM AGENT100.
