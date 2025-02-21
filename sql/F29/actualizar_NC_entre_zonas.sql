DELIMITER $$

CREATE TRIGGER `calcular_NC_entre_zonas`
BEFORE INSERT ON `EN_IFM_STANDARD`
FOR EACH ROW
BEGIN
    IF NEW.numero_cruces IS NOT NULL AND NEW.numero_cruces >= 0 AND NEW.frecuencia_recorrido >= 0 THEN
        SET NEW.NC = (NEW.numero_cruces * NEW.frecuencia_recorrido) + (6 * NEW.frecuencia_recorrido);
    ELSE
        SET NEW.NC = 0;
    END IF;
END$$

DELIMITER ;
