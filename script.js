document.addEventListener("DOMContentLoaded", () => {
    const eventsContainer = document.getElementById("events-container");

    fetch('events.rss')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, "text/xml");
            const items = xml.querySelectorAll("item");

            items.forEach(item => {
                const title = item.querySelector("title").textContent;
                const description = item.querySelector("description").textContent;
                const location = item.querySelector("location")?.textContent || "No location provided";
                const date = new Date(item.querySelector("pubDate").textContent);
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
        })
        .catch(error => {
            console.error('Error fetching the events:', error);
        });
});
