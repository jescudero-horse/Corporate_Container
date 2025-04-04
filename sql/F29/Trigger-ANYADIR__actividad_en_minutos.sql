DELIMITER $$

CREATE TRIGGER `calcular_actividad_en_minutos`
BEFORE UPDATE ON `EN_IFM_STANDARD`
FOR EACH ROW
BEGIN
    IF NEW.TL_TV IS NOT NULL AND NEW.CDVB_CDL IS NOT NULL THEN
        SET NEW.actividad_en_minutos = ((NEW.TL_TV * 2) + (NEW.CDVB_CDL * 2) + NEW.NC + NEW.NP + NEW.PS10 + NEW.PS14) / 100;
    ELSE
        SET NEW.actividad_en_minutos = 0;
    END IF;
END$$

DELIMITER ;
