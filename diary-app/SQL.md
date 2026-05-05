CREATE OR REPLACE VIEW mood_percentages AS
WITH mood_counts AS (
  SELECT
    mood,
    COUNT(*) AS count
  FROM entries
  WHERE mood IS NOT NULL AND mood != ''
  GROUP BY mood
),
total AS (
  SELECT COUNT(*) AS total_count
  FROM entries
  WHERE mood IS NOT NULL AND mood != ''
)
SELECT
  mood,
  count,
  ROUND((count::numeric / total_count) * 100, 2) AS percentage
FROM mood_counts, total
ORDER BY percentage DESC;