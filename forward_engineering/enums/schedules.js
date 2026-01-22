const ScheduleTypesEnum = Object.freeze({
	NONE: 'None',
	CRON: 'Cron',
	EVERY: 'Every',
	TRIGGER_ON_UPDATE: 'Trigger on Update',
	TRIGGER_ON_UPDATE_BETA: 'Trigger on Update (Beta)',
});

const ScheduleUnitEnum = Object.freeze({
	HOURS: 'HOURS',
	DAYS: 'DAYS',
	WEEKS: 'WEEKS',
});

module.exports = {
	ScheduleTypesEnum,
	ScheduleUnitEnum,
};
