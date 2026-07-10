ALTER TABLE pets DROP CONSTRAINT pets_microchip_unique;
CREATE UNIQUE INDEX pets_microchip_unique ON pets (microchip) WHERE microchip IS NOT NULL;
