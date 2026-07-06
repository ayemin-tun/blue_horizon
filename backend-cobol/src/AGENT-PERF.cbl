       IDENTIFICATION DIVISION.
       PROGRAM-ID. AGENT-PERF.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO
               '../../backend-python/data/agent_perf_input.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO
               '../../backend-python/data/agent_perf_output.txt'
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
       01  WS-USER-ID-STR          PIC X(10).
       01  WS-AGENT-CODE           PIC X(50).
       01  WS-USERNAME             PIC X(50).
       01  WS-TOTAL-STR            PIC X(10).
       01  WS-CONFIRMED-STR        PIC X(10).
       01  WS-CANCELLED-STR        PIC X(10).
       01  WS-REVENUE-STR          PIC X(15).
       01  WS-DAYS-ACTIVE-STR      PIC X(10).

      *Numeric Fields
       01  WS-USER-ID              PIC 9(9) VALUE ZERO.
       01  WS-TOTAL                PIC 9(9) VALUE ZERO.
       01  WS-CONFIRMED            PIC 9(9) VALUE ZERO.
       01  WS-CANCELLED            PIC 9(9) VALUE ZERO.
       01  WS-REVENUE              PIC 9(13)V99 VALUE ZERO.
       01  WS-DAYS-ACTIVE          PIC 9(9) VALUE ZERO.
       01  WS-PROJ-BASE            PIC 9(9) VALUE ZERO.

       01  WS-SUCCESS-RATE         PIC 9(3)V99 VALUE ZERO.
       01  WS-PROJECTED-MONTHLY    PIC 9(13)V99 VALUE ZERO.

      *Output Formatting Fields
       01  WS-OUT-USER-ID          PIC Z(8)9.
       01  WS-OUT-TOTAL            PIC Z(8)9.
       01  WS-OUT-CONFIRMED        PIC Z(8)9.
       01  WS-OUT-CANCELLED        PIC Z(8)9.
       01  WS-OUT-REVENUE          PIC Z(12)9.
       01  WS-OUT-SUCCESS-RATE     PIC ZZ9.99.
       01  WS-OUT-PROJECTED        PIC Z(12)9.
       01  WS-OUT-BADGE            PIC X(10).

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
           MOVE SPACES TO WS-USER-ID-STR WS-AGENT-CODE WS-USERNAME
           MOVE SPACES TO WS-TOTAL-STR WS-CONFIRMED-STR WS-CANCELLED-STR
           MOVE SPACES TO WS-REVENUE-STR WS-DAYS-ACTIVE-STR

           UNSTRING INPUT-RECORD DELIMITED BY ','
               INTO WS-USER-ID-STR
                    WS-AGENT-CODE
                    WS-USERNAME
                    WS-TOTAL-STR
                    WS-CONFIRMED-STR
                    WS-CANCELLED-STR
                    WS-REVENUE-STR
                    WS-DAYS-ACTIVE-STR
           END-UNSTRING.

           COMPUTE WS-USER-ID = FUNCTION NUMVAL(WS-USER-ID-STR).
           COMPUTE WS-TOTAL = FUNCTION NUMVAL(WS-TOTAL-STR).
           COMPUTE WS-CONFIRMED = FUNCTION NUMVAL(WS-CONFIRMED-STR).
           COMPUTE WS-CANCELLED = FUNCTION NUMVAL(WS-CANCELLED-STR).
           COMPUTE WS-REVENUE = FUNCTION NUMVAL(WS-REVENUE-STR).
           COMPUTE WS-DAYS-ACTIVE = FUNCTION NUMVAL(WS-DAYS-ACTIVE-STR).

           IF WS-TOTAL > 0
            COMPUTE WS-SUCCESS-RATE = (WS-CONFIRMED * 100.0) / WS-TOTAL
           ELSE
               MOVE 0 TO WS-SUCCESS-RATE
           END-IF.

           IF WS-DAYS-ACTIVE > 30
               MOVE WS-DAYS-ACTIVE TO WS-PROJ-BASE
           ELSE
               MOVE 30 TO WS-PROJ-BASE
           END-IF.

           IF WS-PROJ-BASE > 0
               COMPUTE WS-PROJECTED-MONTHLY =
               (WS-REVENUE * 30.0) / WS-PROJ-BASE
           ELSE
               MOVE 0 TO WS-PROJECTED-MONTHLY
           END-IF.

           IF WS-SUCCESS-RATE >= 80
               MOVE 'GREEN' TO WS-OUT-BADGE
           ELSE IF WS-SUCCESS-RATE >= 60
               MOVE 'AMBER' TO WS-OUT-BADGE
           ELSE
               MOVE 'RED' TO WS-OUT-BADGE
           END-IF.

           MOVE WS-USER-ID TO WS-OUT-USER-ID.
           MOVE WS-TOTAL TO WS-OUT-TOTAL.
           MOVE WS-CONFIRMED TO WS-OUT-CONFIRMED.
           MOVE WS-CANCELLED TO WS-OUT-CANCELLED.
           MOVE WS-REVENUE TO WS-OUT-REVENUE.
           MOVE WS-SUCCESS-RATE TO WS-OUT-SUCCESS-RATE.
           MOVE WS-PROJECTED-MONTHLY TO WS-OUT-PROJECTED.

           MOVE SPACES TO OUTPUT-RECORD.
           STRING 'AGENT|'
                  FUNCTION TRIM(WS-OUT-USER-ID) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-AGENT-CODE) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-USERNAME) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-SUCCESS-RATE) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-PROJECTED) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-TOTAL) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-CONFIRMED) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-CANCELLED) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-REVENUE) DELIMITED BY SIZE
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-BADGE) DELIMITED BY SIZE
                  INTO OUTPUT-RECORD
           END-STRING.
           WRITE OUTPUT-RECORD.
