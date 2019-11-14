DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS articles;
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(60) NOT NULL,
    UNIQUE(email)
);
-- date
-- title
-- imageurl
-- title
-- content
-- sourceurl
-- source
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY NOT NULL,
    email VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    user_agent VARCHAR(612),
    date timestamp
);
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY NOT NULL,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    imageurl VARCHAR(255) NOT NULL,
    content text NOT NULL,
    sourceurl VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    UNIQUE(slug)
);
INSERT INTO users (email, name, password) VALUES('test@test.com', 'tester', 'test');

INSERT INTO articles (slug, title, date, imageurl, content, sourceurl, source) 
VALUES('googles-wear-os-gets-tiles',
    'Google’s Wear OS gets tiles',
    '2019-05-01 17:11',
    'Tiles_Swipethrough_smaller.gif',
'Google announced an interesting new Wear OS feature today that makes a number of highly used features more easily available. Google calls this feature ’tiles’ and it makes information, like the local weather forecast, headlines, your next calendar event, goals and your heart rate, as well as tools, like the Wear OS built-in timer, available with just a few swipes to the left.

In the most recent version of Wear OS, tiles also existed in some form, but the only available tile was Google Fit, which opened with a single swipe. Now, you’ll be able to swipe further and bring up these new tiles, too.',
    'https://techcrunch.com/2019/05/01/googles-wear-os-gets-tiles/',
    'techcrunch.com'
),
('microsoft-launches-a-drag-and-drop-machine-learning-tool',
    'Microsoft launches a drag-and-drop machine learning tool',
    '2019-05-02 01:23', 
    'microsoft.jpg',
'Microsoft today announced three new services that all aim to simplify the process of machine learning. These range from a new interface for a tool that completely automates the process of creating models, to a new no-code visual interface for building, training and deploying models, all the way to hosted Jupyter-style notebooks for advanced users.

Getting started with machine learning is hard. Even to run the most basic of experiments takes a good amount of expertise. All of these new tools greatly simplify this process by hiding away the code or giving those who want to write their own code a pre-configured platform for doing so.',
    'https://techcrunch.com/2019/05/02/microsoft-launches-a-drag-and-drop-machine-learning-tool-and-hosted-jupyter-notebooks/',
    'techcrunch.com'
),
('amd-on-ps5-were-really-excited-about-what-the-next-generation-playstation-will-do',
    'AMD on PS5: "We’re really excited about what the next generation Playstation will do"',
    '2019-05-03 16:35', 
    'radeon.jpg',
'It’s already been confirmed that the PS5, or whatever Sony calls its next-gen console, will be powered by a custom-built graphics card based on the AMD Navi architecture. And now, AMD has started opening up about that new partnership.

Speaking with CNBC Mad Money’s Jim Cramer, AMD CEO Lisa Su said that 2019 was going to be a"big year" for the company, and although AMD is working on "many, many products", it’s particularly "proud" to be working with PlayStation to deliver the PS5 - which currently isn’t reported to arrive until May 2020 at the earliest.',
    'https://www.gamesradar.com/amd-on-ps5-were-really-excited-about-what-the-next-generation-playstation-will-do/',
    'gamesradar.com'
),
('huawei-is-selling-more-smartphones-than-apple-now',
    'Huawei is selling more smartphones than Apple now',
    '2019-05-03 15:40', 
    'huawei.webp',
"Huawei Technologies overtook Apple to become the world's second-biggest smartphone maker in the first quarter, moving a step closer to its avowed ambition of displacing Samsung at the top of the market.

The Chinese tech giant, shrugging off a barrage of accusations that it aids espionage for China (which it's repeatedly denied), grew shipments 50 per cent from a year earlier, research firm IDC estimates.",
    'https://www.smh.com.au/business/companies/huawei-is-selling-more-smartphones-than-apple-now-20190503-p51jrx.html',
    'smh.com.au'
),
('google-introduces-new-feature-to-auto-delete-your-location-and-activity-data',
    'Google Introduces New Feature to Auto-Delete Your Location and Activity Data',
    '2019-05-02 13:30',
    'google.jpg',
"Knowing that our apps gather boatloads of information about us – some for years – can be unsettling. Google’s various apps are chief among these, and the company said it has heard user requests to make managing their data a simpler process. The company announced Wednesday that it’s rolling out a new feature to allow users to auto-delete their location and activity data after 3 or 18 months.

According to TechCrunch, the feature will extend to a user’s browsing history in Chrome, as well as in-app data and the Google Discover feature for Android. When asked by Gizmodo for confirmation, Google would not confirm how far the auto-delete feature extends across its products but it should apply to services that use your Google login.",
    'https://www.gizmodo.co.uk/2019/05/google-introduces-new-feature-to-auto-delete-your-location-and-activity-data/',
    'gizmodo.co.uk'
)

