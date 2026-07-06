       IDENTIFICATION DIVISION.
       PROGRAM-ID. ROUTE-DEMAND.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO
               '../../backend-python/data/route_demand_input.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO
               '../../backend-python/data/route_demand_output.txt'
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
       01  WS-DEP-CITY             PIC X(50).
       01  WS-ARR-CITY             PIC X(50).
       01  WS-DEP-CODE             PIC X(5).
       01  WS-ARR-CODE             PIC X(5).
       01  WS-OCCUPIED-STR         PIC X(10).
       01  WS-CAPACITY-STR         PIC X(10).
       01  WS-FLIGHTS-STR          PIC X(10).
       01  WS-REVENUE-STR          PIC X(15).

      *Numeric Fields
       01  WS-OCCUPIED             PIC 9(9) VALUE ZERO.
       01  WS-CAPACITY             PIC 9(9) VALUE ZERO.
       01  WS-FLIGHTS              PIC 9(9) VALUE ZERO.
       01  WS-REVENUE              PIC 9(13)V99 VALUE ZERO.
       01  WS-LOAD-FACTOR          PIC 9(3)V99 VALUE ZERO.

      *Output Formatting Fields
       01  WS-OUT-LOAD-FACTOR      PIC ZZ9.99.
       01  WS-OUT-FLIGHTS          PIC Z(8)9.
       01  WS-OUT-OCCUPIED         PIC Z(8)9.
       01  WS-OUT-CAPACITY         PIC Z(8)9.
       01  WS-OUT-REVENUE          PIC Z(12)9.
       01  WS-OUT-STATUS           PIC X(10).

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
           MOVE SPACES TO WS-DEP-CITY WS-ARR-CITY
           WS-DEP-CODE WS-ARR-CODE
           MOVE SPACES TO WS-OCCUPIED-STR WS-CAPACITY-STR
           WS-FLIGHTS-STR WS-REVENUE-STR

           UNSTRING INPUT-RECORD DELIMITED BY ','
               INTO WS-DEP-CITY
                    WS-ARR-CITY
                    WS-DEP-CODE
                    WS-ARR-CODE
                    WS-OCCUPIED-STR
                    WS-CAPACITY-STR
                    WS-FLIGHTS-STR
                    WS-REVENUE-STR
           END-UNSTRING.

           COMPUTE WS-OCCUPIED = FUNCTION NUMVAL(WS-OCCUPIED-STR).
           COMPUTE WS-CAPACITY = FUNCTION NUMVAL(WS-CAPACITY-STR).
           COMPUTE WS-FLIGHTS = FUNCTION NUMVAL(WS-FLIGHTS-STR).
           COMPUTE WS-REVENUE = FUNCTION NUMVAL(WS-REVENUE-STR).

           IF WS-CAPACITY > 0
               COMPUTE WS-LOAD-FACTOR = (WS-OCCUPIED * 100.0)
               / WS-CAPACITY
           ELSE
               MOVE 0 TO WS-LOAD-FACTOR
           END-IF.

           IF WS-LOAD-FACTOR >= 70
               MOVE 'HIGH' TO WS-OUT-STATUS
           ELSE IF WS-LOAD-FACTOR >= 40
               MOVE 'MEDIUM' TO WS-OUT-STATUS
           ELSE
               MOVE 'LOW' TO WS-OUT-STATUS
           END-IF.

           MOVE WS-LOAD-FACTOR TO WS-OUT-LOAD-FACTOR.
           MOVE WS-FLIGHTS TO WS-OUT-FLIGHTS.
           MOVE WS-OCCUPIED TO WS-OUT-OCCUPIED.
           MOVE WS-CAPACITY TO WS-OUT-CAPACITY.
           MOVE WS-REVENUE TO WS-OUT-REVENUE.

           MOVE SPACES TO OUTPUT-RECORD.
           STRING 'ROUTE|'
                  FUNCTION TRIM(WS-DEP-CITY) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-ARR-CITY) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-DEP-CODE) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-ARR-CODE) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-LOAD-FACTOR)
                  DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-STATUS) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-FLIGHTS) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-OCCUPIED) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-CAPACITY) DELIMITED BY SIZE '|'
                  FUNCTION TRIM(WS-OUT-REVENUE) DELIMITED BY SIZE
                  INTO OUTPUT-RECORD
           END-STRING.
           WRITE OUTPUT-RECORD.
