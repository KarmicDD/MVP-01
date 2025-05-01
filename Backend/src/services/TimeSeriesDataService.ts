/**
 * Service for processing and enhancing time-series data
 */
export class TimeSeriesDataService {
    /**
     * Fill gaps in time-series data to ensure continuous data for charts
     * @param data Array of data points with date and count properties
     * @param startDate Start date for the time range
     * @param endDate End date for the time range
     * @param dateField Name of the date field in the data
     * @param valueField Name of the value field in the data
     * @returns Array of data points with gaps filled
     */
    public fillTimeSeriesGaps(
        data: any[],
        startDate: Date,
        endDate: Date,
        dateField: string = 'date',
        valueField: string = 'count'
    ): any[] {
        // Create a map of existing data points
        const dataMap = new Map();
        data.forEach(item => {
            const dateStr = typeof item[dateField] === 'string' 
                ? item[dateField] 
                : new Date(item[dateField]).toISOString().split('T')[0];
            dataMap.set(dateStr, item[valueField]);
        });

        // Generate all dates in the range
        const allDates: string[] = [];
        const currentDate = new Date(startDate);
        const lastDate = new Date(endDate);

        while (currentDate <= lastDate) {
            allDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create the complete time series with filled gaps
        return allDates.map(dateStr => {
            return {
                [dateField]: dateStr,
                [valueField]: dataMap.has(dateStr) ? dataMap.get(dateStr) : 0
            };
        });
    }

    /**
     * Aggregate time-series data by time period (day, week, month)
     * @param data Array of data points with date and count properties
     * @param period Aggregation period ('day', 'week', 'month')
     * @param dateField Name of the date field in the data
     * @param valueField Name of the value field in the data
     * @returns Aggregated data
     */
    public aggregateByPeriod(
        data: any[],
        period: 'day' | 'week' | 'month',
        dateField: string = 'date',
        valueField: string = 'count'
    ): any[] {
        // Create a map to store aggregated values
        const aggregatedData = new Map();

        data.forEach(item => {
            const date = new Date(typeof item[dateField] === 'string' ? item[dateField] : item[dateField]);
            let periodKey: string;

            if (period === 'day') {
                periodKey = date.toISOString().split('T')[0];
            } else if (period === 'week') {
                // Get the Monday of the week
                const day = date.getDay();
                const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
                const monday = new Date(date);
                monday.setDate(diff);
                periodKey = monday.toISOString().split('T')[0];
            } else if (period === 'month') {
                periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else {
                periodKey = date.toISOString().split('T')[0];
            }

            if (aggregatedData.has(periodKey)) {
                aggregatedData.set(periodKey, aggregatedData.get(periodKey) + item[valueField]);
            } else {
                aggregatedData.set(periodKey, item[valueField]);
            }
        });

        // Convert map to array
        return Array.from(aggregatedData.entries()).map(([key, value]) => ({
            [dateField]: key,
            [valueField]: value
        }));
    }

    /**
     * Calculate percentage change between two time periods
     * @param currentPeriodData Data for the current period
     * @param previousPeriodData Data for the previous period
     * @param valueField Name of the value field in the data
     * @returns Percentage change
     */
    public calculatePercentageChange(
        currentPeriodData: any[],
        previousPeriodData: any[],
        valueField: string = 'count'
    ): number {
        const currentTotal = currentPeriodData.reduce((sum, item) => sum + item[valueField], 0);
        const previousTotal = previousPeriodData.reduce((sum, item) => sum + item[valueField], 0);

        if (previousTotal === 0) {
            return currentTotal > 0 ? 100 : 0;
        }

        return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
    }
}

export default new TimeSeriesDataService();
