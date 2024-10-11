"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const eventsContainer = document.getElementById("events-container");
    fetch('events.rss')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const items = xml.querySelectorAll("item");

            const loadPage = (items) => {
                items.forEach(item => {
                    const title = item.querySelector("title").textContent;
                    const description = item.querySelector("description").textContent;
                    const location = item.querySelector("location")?.textContent || "No location provided";
                    const date = new Date(item.querySelector("start").textContent);
                    const formattedDate = date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    const imageUrl = item.querySelector("enclosure")?.getAttribute('url') || 'https://static.campuslabsengage.com/discovery/images/events/learning.jpg';

                    // Creating event card
                    const article = document.createElement('article');
                    article.innerHTML = `
                    <img src="${imageUrl}" alt="${title}">
                    <h3>${title}</h3>
                    <p class="event-date">${formattedDate}</p>
                    <p class="event-location">${location}</p>
                    <div class="button-container">
                        <button class="learn-more">Learn more</button>
                    </div>
                    <div class="description">${description}</div>
                    `;

                    // Toggle description
                    const learnMore = article.querySelector('.learn-more');
                    const desc = article.querySelector('.description');
                    learnMore.addEventListener('click', () => {
                        desc.style.display = desc.style.display === 'block' ? 'none' : 'block';
                    });

                    eventsContainer.appendChild(article);
                });

                // Inner function to remove the cards. This is returned so that it can be accessed outside the function.
                const removeArticles = () => {
                    eventsContainer.innerHTML = '';
                }
                return removeArticles;
            }
            const removeArticles = loadPage(items);

            /* Filter: creates a subset of "list" and then calls loadPage() again with the new list */

            // This is updated whenever submit button is clicked Here >.<
            const filterObj = {
                "title" : "",
                "desc" : "", // Keeping the description field for future use
                "startDate" : ""
            }

            // Generic filter function, will work for any filter
            const filterEvents = (items, filterValue, filterFunction) => {
                let filteredList = [];
                items.forEach(item => {
                    if (filterFunction(item, filterValue)) {
                        filteredList.push(item);
                    }
                })
                return filteredList;
            };

            const submit_btn = document.querySelector("#submit-btn");
            submit_btn.addEventListener("click", () => { // Do the following when the submit button is clicked
                let filteredItems = items;
                filterObj.startDate = document.querySelector("#date").value
                if (filterObj.startDate !== "") { // A date has been entered
                    const dateFilter = (item, value) => { // Date filter function. Item: item from rss. Value: user-specified date
                        let itemDate = new Date(item.querySelector("start").textContent).setHours(0, 0, 0, 0);
                        let inputDate = new Date(value).setHours(0, 0, 0, 0);
                        return itemDate === inputDate ? true : false;
                    }
                    let filteredByDate = filterEvents(filteredItems, filterObj.startDate, dateFilter); // Events having the specified date are stored in filteredByDate
                    filteredItems = filteredByDate;
                }
                
                // Filter by title functionality vvv
                filterObj.title = document.querySelector("#title").value
                if (filterObj.title !== "") { // A title has been entered
                    const titleFilter = (item, value) => { // Title filter function. Item: item from rss. Value: user-specified title
                        let itemTitle = item.querySelector("title").textContent.toLowerCase();
                        return itemTitle.includes(value.toLowerCase());
                    }
                    let filteredByTitle = filterEvents(filteredItems, filterObj.title, titleFilter); // Events having the specified title are stored in filteredByTitle
                    filteredItems = filteredByTitle;
                }

                // Filter by description functionality (Christian's code)
                filterObj.desc = document.querySelector("#desc").value; // Check if a description is entered
                if (filterObj.desc !== "") { // A description has been entered
                    const descriptionFilter = (item, value) => { // Description filter function. Item: item from rss. Value: user-specified description
                        let itemDescription = item.querySelector("description").textContent.toLowerCase();
                        return itemDescription.includes(value.toLowerCase()); // Check if the description contains the value
                    }
                    let filteredByDesc = filterEvents(filteredItems, filterObj.desc, descriptionFilter); // Events having the specified description are stored in filteredByDesc
                    filteredItems = filteredByDesc;
                }
                removeArticles(); // Clear cards
                loadPage(filteredItems); // Load new cards

            });

            /* Clear Filters Functionality (Christian's code) */
            const clearFilters = () => {
                // Clear all input fields (title, description, and date)
                document.querySelector("#title").value = "";
                document.querySelector("#desc").value = "";
                document.querySelector("#date").value = "";

                removeArticles();  // Clear the existing events
                loadPage(items);  // Reload all events
            }

            // Attach the event listener to the "Clear Filters" button (it is the second button in our HTML according to DOM> )
            const clearBtn = document.querySelector("button:nth-of-type(2)");
            clearBtn.addEventListener("click", clearFilters);

            /* End of Filter */
        }).catch(error => {
            console.error('Error fetching the events:', error);
        });
});
