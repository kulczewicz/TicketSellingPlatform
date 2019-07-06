CREATE TABLE event(
    id uuid DEFAULT uuid_generate_v4(),
    name varchar(255) NOT NULL,
    timestamp timestamp NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE ticket(
    id uuid DEFAULT uuid_generate_v4(),
    event uuid REFERENCES event(id) NOT NULL,
    sold boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE OR REPLACE FUNCTION addTickets()
    RETURNS trigger AS
$$
DECLARE
    myid uuid;
BEGIN
    FOR counter IN 1..10 LOOP
        INSERT INTO ticket (event, sold) VALUES (NEW.id, FALSE);
    END LOOP;
    RETURN NEW;
END;
$$
LANGUAGE 'plpgsql';

CREATE TRIGGER eventTrigger AFTER INSERT ON event
    FOR EACH ROW EXECUTE PROCEDURE addTickets();

INSERT INTO event (name, timestamp) VALUES
    ('Primavera Sound', '2019-05-30 12:00:00+01'),
    ('Rock am Ring', '2019-06-07 12:00:00+01'),
    ('Glastonbury', '2019-06-26 12:00:00+00'),
    ('Roskilde', '2019-06-29 12:00:00+01'),
    ('Opener', '2019-07-03 12:00:00+01');