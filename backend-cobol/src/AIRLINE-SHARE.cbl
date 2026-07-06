       IDENTIFICATION DIVISION.
       PROGRAM-ID. AIRLINE-SHARE.

       ENVIRONMENT DIVISION.
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INPUT-FILE ASSIGN TO
               '../../backend-python/data/airline_share_input.csv'
               ORGANIZATION IS LINE SEQUENTIAL.
           SELECT OUTPUT-FILE ASSIGN TO
               '../../backend-python/data/airline_share_output.txt'
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
       01  WS-RANK-STR             PIC X(5).
       01  WS-AIRLINE-NAME         PIC X(50).
       01  WS-SHARE-STR            PIC X(10).
       01  WS-BOOKINGS-STR         PIC X(10).
       01  WS-REVENUE-STR          PIC X(15).

      *Numeric Fields
       01  WS-RANK                 PIC 9(2) VALUE ZERO.
       01  WS-SHARE                PIC 9(3)V99 VALUE ZERO.
       01  WS-BOOKINGS             PIC 9(9) VALUE ZERO.
       01  WS-REVENUE              PIC 9(13)V99 VALUE ZERO.

      *Output Fields
       01  WS-OUT-RANK             PIC Z9.
       01  WS-OUT-SHARE            PIC ZZ9.99.
       01  WS-OUT-BOOKINGS         PIC Z(8)9.
       01  WS-OUT-REVENUE          PIC Z(12)9.
       01  WS-OUT-POSITION         PIC X(20).
       
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
           MOVE SPACES TO WS-RANK-STR WS-AIRLINE-NAME 
           MOVE SPACES TO WS-SHARE-STR WS-BOOKINGS-STR WS-REVENUE-STR

           UNSTRING INPUT-RECORD DELIMITED BY ','
               INTO WS-RANK-STR
                    WS-AIRLINE-NAME
                    WS-SHARE-STR
                    WS-BOOKINGS-STR
                    WS-REVENUE-STR
           END-UNSTRING.

           COMPUTE WS-RANK = FUNCTION NUMVAL(WS-RANK-STR).
           COMPUTE WS-SHARE = FUNCTION NUMVAL(WS-SHARE-STR).
           COMPUTE WS-BOOKINGS = FUNCTION NUMVAL(WS-BOOKINGS-STR).
           COMPUTE WS-REVENUE = FUNCTION NUMVAL(WS-REVENUE-STR).

           IF WS-RANK = 1
               MOVE 'LEADER' TO WS-OUT-POSITION
           ELSE IF WS-RANK = 2
               MOVE 'SECOND' TO WS-OUT-POSITION
           ELSE
               MOVE 'OTHERS' TO WS-OUT-POSITION
           END-IF.

           MOVE WS-RANK TO WS-OUT-RANK.
           MOVE WS-SHARE TO WS-OUT-SHARE.
           MOVE WS-BOOKINGS TO WS-OUT-BOOKINGS.
           MOVE WS-REVENUE TO WS-OUT-REVENUE.

           MOVE SPACES TO OUTPUT-RECORD.
           STRING 'AIRLINE|' 
                  FUNCTION TRIM(WS-OUT-RANK) DELIMITED BY SIZE 
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-AIRLINE-NAME) DELIMITED BY SIZE 
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-SHARE) DELIMITED BY SIZE 
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-BOOKINGS) DELIMITED BY SIZE 
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-REVENUE) DELIMITED BY SIZE 
                  '|' DELIMITED BY SIZE
                  FUNCTION TRIM(WS-OUT-POSITION) DELIMITED BY SIZE
                  INTO OUTPUT-RECORD
           END-STRING.
           WRITE OUTPUT-RECORD.
