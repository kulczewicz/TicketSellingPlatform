CREATE TABLE event(
    url varchar(255) PRIMARY KEY,
    name varchar(255) NOT NULL,
    timestamp timestamp NOT NULL
);

CREATE TABLE ticket(
    id uuid DEFAULT uuid_generate_v4(),
    eventurl varchar(255) REFERENCES event(url) NOT NULL,
    available boolean NOT NULL,
    price integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION addTickets()
    RETURNS trigger AS
$$
DECLARE
    myid uuid;
BEGIN
    FOR counter IN 1..10 LOOP
        INSERT INTO ticket (eventurl, available, price) VALUES (NEW.url, TRUE, 5000);
    END LOOP;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER eventTrigger AFTER INSERT ON event
    FOR EACH ROW EXECUTE PROCEDURE addTickets();

INSERT INTO event VALUES
    ('primavera-2019', 'Primavera Sound', '2019-05-30 12:00:00+01'),
    ('rock-am-ring-2019' , 'Rock am Ring', '2019-06-07 12:00:00+01'),
    ('glastonbury-2019' , 'Glastonbury Festival', '2019-06-26 12:00:00+00'),
    ('roskilde-2019', 'Roskilde Festival', '2019-06-29 12:00:00+01'),
    ('opener-2019', 'Opener Festival', '2019-07-03 12:00:00+01');