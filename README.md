# VTU Results Scraper
A website to scrape results from VTU, and cache in a database, with support for updating the database with revaluation results. Built with the MERN stack, and uses React-Router v4 and Cheerio.  

# Setup
To setup this project in your local machine, read this section.

## Prerequisites
You must have the following installed and set up.
* MongoDB 3.x
* Node.js
* yarn

## Setting Up
1. Make sure MongoDB daemon is running and set to run on startup.
2. Run `yarn`.
3. Run either `npm run server` or `npm start`.

# Project Structure
## React Components
* `App`: Contains the routes for React-Router.
* `Batch`: The component rendered for retrieving results in a batch
* `ChartCard`: A card component which holds a chart and a table. This is used in the `Batch` component.
* `Individual`: The component rendered for retrieving an individual result.
* `IndividualTable`: The table displaying the results in the `Individual` component.
* `MainPage`: The home page.
* `Report`: The printable report generated for batch results. Used in the `Batch` component.
* `SideMenu`: The side menu with navigation links.
* `UpdateReval`: The component rendered for updating the revaluation results in the database.

## MongoDB Structure
The project uses a single MongoDB database, `results`, with a single collection, `results`. It is assumed that MongoDB is running on port `27017`, the default.