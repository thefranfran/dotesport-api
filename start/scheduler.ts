import SchedulerService from '#services/scheduler_service'
import ArticlesJob from '#jobs/articles_job'

// Create an instance of the scheduler service on server startup
const scheduler = new SchedulerService()

// Add all jobs which should be run while the server is up
scheduler.addJob({
  key: 'articles-job',
  cronExpression: '0 */6 * * *',
  job: new ArticlesJob(),
})

// Actually start a scheduler for all jobs
scheduler.scheduleAllJobs()
