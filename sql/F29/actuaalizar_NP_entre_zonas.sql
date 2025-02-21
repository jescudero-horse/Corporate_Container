DELIMITER $$

CREATE TRIGGER `calcular_NP_entre_zonas`
BEFORE INSERT ON `EN_IFM_STANDARD`
FOR EACH ROW
BEGIN
    IF NEW.numero_puertas IS NOT NULL AND NEW.numero_puertas >= 0 AND NEW.frecuencia_recorrido >= 0 THEN
        SET NEW.NP = (NEW.numero_puertas * NEW.frecuencia_recorrido) + (6 * NEW.frecuencia_recorrido);
    ELSE
        SET NEW.NP = 0;
    END IF;
END$$

DELIMITER ;
