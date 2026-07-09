
"""
update_departed_status.py
─────────────────────────────────────────────────────────────────────────────
Run this FREQUENTLY throughout the day (e.g. every 5-15 minutes via cron).

For every active FlightInstance (is_deleted = 0) that is still SCHEDULED:
  - Combine flight_date + base_departure_time into a real datetime.
  - If that datetime is now in the past, update status to DEPARTED.

This is intentionally kept separate from roll_forward_instances.py since it
needs to run much more often (status should flip soon after departure time
passes), while roll-forward only needs to run once a day.
"""

from batch_common import get_session, models, DATE_FMT, TIME_FMT, datetime, log


def run_status_update(db) -> int:
    now = datetime.now()

    candidates = db.query(models.FlightInstance).filter(
        models.FlightInstance.is_deleted == 0,
        models.FlightInstance.status == "SCHEDULED"
    ).all()

    updated_count = 0
    for inst in candidates:
        try:
            departure_dt = datetime.strptime(
                f"{inst.flight_date.strip()} {inst.base_departure_time.strip()}",
                f"{DATE_FMT} {TIME_FMT}"
            )
        except ValueError:
            log(f"  [error] instance_id={inst.instance_id} -> invalid date/time format, skipping")
            continue

        if departure_dt <= now:
            inst.status = "DEPARTED"
            updated_count += 1
            log(f"  [ok] instance_id={inst.instance_id} ({inst.flight_date} {inst.base_departure_time}) -> DEPARTED")

    log(f"Checked: {len(candidates)}, updated to DEPARTED: {updated_count}")
    return updated_count


def main():
    log("Status-update batch started")
    db = get_session()
    try:
        run_status_update(db)
        db.commit()
        log("Done. Changes committed.")
    except Exception as e:
        db.rollback()
        log(f"[FATAL ERROR] Status-update batch failed, rolled back. Reason: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()