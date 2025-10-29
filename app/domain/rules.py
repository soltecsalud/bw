from datetime import date

def annual_rate_for_dates(start: date, end: date) -> float:
    if start.year == end.year:
        return 0.12
    return 0.15

def effective_rate(term: str, annual: float) -> float:
    return annual/12 if term == "Mensual" else annual
